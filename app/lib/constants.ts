export const gameLocationTypes = {
  indoor: "В помещении",
  outdoor: "На улице",
  both: "Оба варианта",
};

export const activityLevels = {
  low: "Низкая",
  medium: "Средняя",
  high: "Высокая",
};

export const modelTypes = [
  {
    value: "qwen/qwen3.6-27b" as ModelType,
    label: "Qwen3.6 27B (Качественная)",
  },
  {
    value: "qwen/qwen3.5-27b" as ModelType,
    label: "Qwen3.5 27B (Сбалансированная)",
  },
  { value: "qwen/qwen3.6-plus" as ModelType, label: "Qwen3.6 Plus (Быстрая)" },
];
