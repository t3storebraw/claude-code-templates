'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { cn } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartProps {
  type: 'line' | 'bar' | 'doughnut';
  data: any;
  options?: any;
  className?: string;
  title?: string;
}

export default function Chart({ type, data, options, className, title }: ChartProps) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
      },
      title: title ? {
        display: true,
        text: title,
        color: '#374151',
        font: {
          size: 16,
          weight: 'bold',
        },
      } : {
        display: false,
      },
    },
    scales: type !== 'doughnut' ? {
      x: {
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          color: '#6b7280',
        },
      },
    } : undefined,
  };

  const chartOptions = { ...defaultOptions, ...options };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={chartOptions} />;
      case 'bar':
        return <Bar data={data} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={chartOptions} />;
      default:
        return <Line data={data} options={chartOptions} />;
    }
  };

  return (
    <div className={cn("w-full h-full", className)}>
      <div className="h-full min-h-[300px]">
        {renderChart()}
      </div>
    </div>
  );
}

// Função para criar dados de gráfico de linha
export function createLineChartData(labels: string[], datasets: any[]) {
  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: dataset.borderColor || getChartColor(index),
      backgroundColor: dataset.backgroundColor || getChartColor(index, 0.1),
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };
}

// Função para criar dados de gráfico de barras
export function createBarChartData(labels: string[], datasets: any[]) {
  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || getChartColor(index, 0.8),
      borderColor: dataset.borderColor || getChartColor(index),
      borderWidth: 1,
      borderRadius: 4,
    })),
  };
}

// Função para criar dados de gráfico de rosca
export function createDoughnutChartData(labels: string[], data: number[]) {
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map((_, index) => getChartColor(index, 0.8)),
        borderColor: labels.map((_, index) => getChartColor(index)),
        borderWidth: 2,
        cutout: '60%',
      },
    ],
  };
}

// Função para obter cores do gráfico
function getChartColor(index: number, alpha: number = 1): string {
  const colors = [
    `rgba(168, 85, 247, ${alpha})`, // Purple
    `rgba(59, 130, 246, ${alpha})`, // Blue
    `rgba(16, 185, 129, ${alpha})`, // Green
    `rgba(245, 158, 11, ${alpha})`, // Yellow
    `rgba(239, 68, 68, ${alpha})`,  // Red
    `rgba(236, 72, 153, ${alpha})`, // Pink
    `rgba(14, 165, 233, ${alpha})`, // Sky
    `rgba(139, 92, 246, ${alpha})`, // Violet
  ];
  
  return colors[index % colors.length];
}