"use client";

import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip, type ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import styles from "./BarChart.module.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Paleta categórica validada (contraste y daltonismo) para fondo claro; el orden es fijo:
// la primera serie siempre es azul y la segunda naranja, nunca se reciclan.
export const SERIES_COLORS = ["#2a78d6", "#eb6834"] as const;
const INK_MUTED = "#6c6c76";
const GRID = "#f0f0f3";
const ROW_HEIGHT = 30;
const PADDING = 36;
// Etiquetas largas (programas, habilidades) se acortan en el eje; completas en el tooltip y la tabla.
const MAX_TICK_CHARS = 26;
const shorten = (text: string) => (text.length > MAX_TICK_CHARS ? `${text.slice(0, MAX_TICK_CHARS - 1)}…` : text);

export type BarChartSeries = {
  name: string;
  values: number[];
  /** Texto del tooltip y de la tabla para cada barra (si no, el número). */
  display?: string[];
};

type BarChartProps = {
  /** Nombre del gráfico para lectores de pantalla. */
  label: string;
  categories: string[];
  /** Una serie (sin leyenda) o dos (con leyenda). */
  series: BarChartSeries[];
  emptyMessage?: string;
};

/**
 * Barras horizontales con Chart.js (RT15). Barras delgadas con punta redondeada, tooltip al pasar
 * el cursor y una tabla equivalente para lectores de pantalla: el dato nunca depende solo del color.
 */
export function BarChart({ label, categories, series, emptyMessage = "Sin datos todavía." }: BarChartProps) {
  if (categories.length === 0) return <p className={styles.empty}>{emptyMessage}</p>;
  const showLegend = series.length > 1;

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    layout: { padding: { left: 8 } },
    plugins: {
      legend: {
        display: showLegend,
        position: "top",
        align: "start",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          color: INK_MUTED,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = series[context.datasetIndex];
            const text = item.display?.[context.dataIndex] ?? String(context.parsed.x);
            return showLegend ? `${item.name}: ${text}` : text;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: GRID },
        border: { display: false },
        ticks: { color: INK_MUTED, precision: 0, font: { size: 11 } },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: INK_MUTED,
          font: { size: 12 },
          autoSkip: false,
          callback: (_value, index) => shorten(categories[index] ?? ""),
        },
      },
    },
  };

  const data = {
    labels: categories,
    datasets: series.map((item, index) => ({
      label: item.name,
      data: item.values,
      backgroundColor: SERIES_COLORS[index],
      hoverBackgroundColor: SERIES_COLORS[index],
      borderRadius: 4,
      borderSkipped: "start" as const,
      maxBarThickness: series.length > 1 ? 10 : 14,
      categoryPercentage: 0.8,
      barPercentage: 0.9,
    })),
  };

  const height = categories.length * ROW_HEIGHT * (series.length > 1 ? 1.3 : 1) + PADDING + (showLegend ? 24 : 0);

  return (
    <figure className={styles.figure}>
      <div className={styles.canvas} style={{ height }} role="img" aria-label={label}>
        <Bar options={options} data={data} />
      </div>
      <table className={styles.srOnly}>
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Categoría</th>
            {series.map((item) => (
              <th key={item.name} scope="col">
                {item.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category, row) => (
            <tr key={category}>
              <th scope="row">{category}</th>
              {series.map((item) => (
                <td key={item.name}>{item.display?.[row] ?? item.values[row]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
