import { drawBarChart } from "../lib/chart.js";

function init() {
  drawRevenueChart();
}

function drawRevenueChart() {
  const ctx = document.querySelector("#revenueChart").getContext("2d");
  const data = [
    { value: 12, label: "Monday" },
    { value: 14, label: "Tuesday" },
    { value: 4, label: "Wednesday" },
    { value: 8, label: "Thursday" },
    { value: 3, label: "Friday" },
    { value: 7, label: "Saturday" },
    { value: 4, label: "Sunday" },
  ];
  drawBarChart(data, ctx, Chart);
}

init();
