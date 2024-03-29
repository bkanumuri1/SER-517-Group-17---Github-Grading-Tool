import React from "react";
import { Bar,Line,Doughnut,Pie } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import './PullRequestsBarChart.css'

function BarChart({ chartData }) {
  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <Bar
          data={chartData}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                  },
                },
              ],
            },
          }}
        />
      </div>
    </div>
  );
}

export default BarChart;