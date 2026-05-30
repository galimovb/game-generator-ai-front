import { jsPDF } from "jspdf";
import { gameLocationTypes, activityLevels } from "~/lib/constants";

let cachedFonts: { regular: string; bold: string } | null = null;

const loadFonts = async () => {
  if (cachedFonts) return cachedFonts;
  const toBase64 = async (url: string) => {
    const buf = await fetch(url).then((r) => r.arrayBuffer());
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++)
      binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };
  const [regular, bold] = await Promise.all([
    toBase64("/fonts/Roboto-Regular.ttf"),
    toBase64("/fonts/Roboto-Medium.ttf"),
  ]);
  cachedFonts = { regular, bold };
  return cachedFonts;
};

export const useGamePdf = () => {
  const exportToPdf = async (game: Game) => {
    const fonts = await loadFonts();

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.addFileToVFS("Roboto-Regular.ttf", fonts.regular);
    doc.addFileToVFS("Roboto-Medium.ttf", fonts.bold);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.addFont("Roboto-Medium.ttf", "Roboto", "bold");
    doc.setFont("Roboto");

    const PAGE_W = 210;
    const MARGIN = 16;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const PAGE_H = 297;
    let y = MARGIN;

    const lineH = (size: number) => size * 0.4;

    const checkPage = (needed: number) => {
      if (y + needed > PAGE_H - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }
    };

    const drawWrappedText = (
      text: string,
      size: number,
      bold = false,
      color: [number, number, number] = [33, 33, 33],
      indent = 0,
    ) => {
      doc.setFontSize(size);
      doc.setFont("Roboto", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, CONTENT_W - indent);
      const h = lines.length * lineH(size);
      checkPage(h);
      doc.text(lines, MARGIN + indent, y);
      y += h + 1;
    };

    const drawDivider = () => {
      y += 2;
      checkPage(1);
      doc.setDrawColor(200, 200, 200);
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += 4;
    };

    // Заголовок
    drawWrappedText(game.title || "Без названия", 18, true);
    drawDivider();

    // Параметры
    const locType =
      gameLocationTypes[game.locationType as keyof typeof gameLocationTypes] ||
      game.locationType ||
      "—";
    const actLevel =
      activityLevels[game.activityLevel as keyof typeof activityLevels] ||
      game.activityLevel ||
      "—";

    const info: [string, string][] = [
      ["Возраст:", game.age ? `${game.age} лет` : "—"],
      ["Игроки:", game.players ? `${game.players} чел` : "—"],
      ["Длительность:", game.duration ? `${game.duration} мин` : "—"],
      ["Локация:", locType],
      [
        "Площадка:",
        game.fieldWidth && game.fieldLength
          ? `${game.fieldWidth} × ${game.fieldLength} м`
          : "—",
      ],
      ["Активность:", actLevel],
      ["Статус:", game.isPublic ? "Публичная" : "Черновик"],
    ];

    for (const [label, value] of info) {
      checkPage(6);
      doc.setFontSize(10);
      doc.setFont("Roboto", "bold");
      doc.setTextColor(120, 120, 120);
      doc.text(label, MARGIN, y);
      doc.setFont("Roboto", "normal");
      doc.setTextColor(33, 33, 33);
      doc.text(value, MARGIN + 32, y);
      y += lineH(10) + 1;
    }

    y += 3;

    if (game.description) {
      drawWrappedText("Описание", 11, true, [80, 80, 80]);
      drawWrappedText(game.description, 10);
      y += 2;
    }

    if (game.locationDescription) {
      drawWrappedText("Описание локации", 11, true, [80, 80, 80]);
      drawWrappedText(game.locationDescription, 10);
      y += 2;
    }

    if (game.requisites?.length) {
      drawWrappedText("Реквизит", 11, true, [80, 80, 80]);
      for (const r of game.requisites)
        drawWrappedText(`• ${r}`, 10, false, [33, 33, 33], 4);
      y += 2;
    }

    if (game.stages?.length) {
      drawDivider();
      drawWrappedText(`Стадии игры (${game.stages.length})`, 12, true);
      y += 2;

      for (let i = 0; i < game.stages.length; i++) {
        const stage = game.stages[i];

        checkPage(14);
        doc.setFontSize(11);
        doc.setFont("Roboto", "bold");
        doc.setTextColor(20, 20, 20);
        doc.text(`${i + 1}. ${stage.title}`, MARGIN, y);
        doc.setFont("Roboto", "normal");
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(10);
        doc.text(`${stage.duration} мин`, PAGE_W - MARGIN, y, {
          align: "right",
        });
        y += lineH(11) + 1;

        if (stage.description) drawWrappedText(stage.description, 10);

        if (stage.tasks?.length) {
          y += 2;
          drawWrappedText("Задания:", 9, true, [120, 120, 120]);
          for (const t of stage.tasks)
            drawWrappedText(`• ${t}`, 9, false, [33, 33, 33], 6);
        }

        if (stage.props?.length) {
          y += 2;
          drawWrappedText("Реквизит этапа:", 9, true, [120, 120, 120]);
          drawWrappedText(stage.props.join(", "), 9, false, [33, 33, 33], 6);
        }

        if (i < game.stages.length - 1) drawDivider();
      }
    }

    // Нумерация страниц
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setFont("Roboto", "normal");
      doc.setTextColor(170, 170, 170);
      doc.text(`${p} / ${total}`, PAGE_W / 2, PAGE_H - 8, { align: "center" });
    }

    doc.save(`${(game.title || "game").replace(/\s+/g, "_")}.pdf`);
  };

  return { exportToPdf };
};
