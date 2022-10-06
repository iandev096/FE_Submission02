const BACKGROUND_COLORS = [
  "rgba(255, 99, 132, 0.2)",
  "rgba(54, 162, 235, 0.2)",
  "rgba(255, 206, 86, 0.2)",
  "rgba(75, 192, 192, 0.2)",
  "rgba(153, 102, 255, 0.2)",
  "rgba(255, 159, 64, 0.2)",
  "rgba(99, 255, 99, .2)",
  "rgba(255, 99, 203, .2)",
  "rgba(99, 239, 255, .2)",
  "rgba(240, 59, 64, .2)",
  "rgba(75, 192, 192, .2)",
  "rgba(255, 206, 86, .2)",
];
const BORDER_COLORS = [
  "rgba(255, 99, 132, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 159, 64, 1)",
  "rgba(99, 255, 99, 1)",
  "rgba(255, 99, 203, 1)",
  "rgba(99, 239, 255, 1)",
  "rgba(240, 59, 64, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(255, 206, 86, 1)",
];

/**
 *
 * @param {{value: number, label: string}} data
 * @param {any} ctx
 * @returns
 */
export function drawBarChart(data, ctx) {
  const labels = data.map((item) => item.label);
  const values = data.map((item) => item.value);

  const config = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "",
          data: values,
          backgroundColor: BACKGROUND_COLORS.slice(0, data.length),
          borderColor: BORDER_COLORS.slice(data.length),
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  return new Chart(ctx, config);
}

export function updateChart(data, chart) {
  const labels = data.map((item) => item.label);
  const values = data.map((item) => item.value);

  chart.data.labels = labels;
  chart.data.datasets = [
    {
      label: "",
      data: values,
      backgroundColor: BACKGROUND_COLORS.slice(0, data.length),
      borderColor: BORDER_COLORS.slice(data.length),
      borderWidth: 1,
    },
  ];

  chart.update();
}
