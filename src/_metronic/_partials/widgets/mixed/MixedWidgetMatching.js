/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useEffect } from "react";
import ApexCharts from "apexcharts";

export function MixedWidgetMatching({ id, value, basecolor }) {
  const chartname = "kt_mixed_widget_matching_" + id;

  let color = "#FFA800";
  let colorlight = "#FFF4DE";

  if (basecolor === "primary") {
    color = "#6993FF";
    colorlight = "#E1E9FF";
  }

  if (basecolor === "success") {
    color = "#1BC5BD";
    colorlight = "#C9F7F5";
  }

  useEffect(() => {
    const element = document.getElementById(chartname);
    if (!element) {
      return;
    }

    const options = getChartOptions(color, colorlight, value);

    const chart = new ApexCharts(element, options);
    chart.render();
    return function cleanUp() {
      chart.destroy();
    };
  });

  return (
    <div id={chartname}></div>
  );
}

function getChartOptions(color, colorlight, value) {
  const options = {
    series: [value],
    chart: {
      height: 100,
      width: 120,
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 0,
          size: "50%"
        },
        dataLabels: {
          showOn: "always",
          name: {
            show: false,
            fontWeight: "700",
          },
          value: {
            color: "#464E5F",
            fontSize: "14px",
            fontWeight: "700",
            offsetY: 6,
            show: true
          },
        },
        track: {
          background: colorlight,
          strokeWidth: '100%'
        }
      }
    },
    colors: [color],
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"]
  };
  return options;
}
