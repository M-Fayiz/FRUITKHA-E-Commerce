let myChart;
let productNames = [];
let productSales = [];
let categoryNames = [];
let categorySales = [];
let totalSales = [];
let totalOrder = [];

async function generateReport() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  const quickFilter = document.getElementById("quickFilter").value;
  if(startDate>endDate){
      return showToast('Invalid startDate or endDate','error');
    }
  try {
    const response = await fetch("/admin/graph", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startDate, endDate, quickFilter }),
    });

    const data = await response.json();

    if (data.success) {
      const chartData = data.report; 
      const category = data.category;
      const categoryName=data.hello
      const sales = data.monthlySales;
    
      // Ensure data is correctly populated
      productNames = chartData.map(item => item._id);
      productSales = chartData.map(item => item.totalsales);
      categoryNames = categoryName
      categorySales = category.map(item => item.TTLsales);

      const labels = sales.map(item => item._id);
      const salesData = sales.map(item => item.totalSales);

      // Render Product Sales Bar Chart
      const ctx = document.getElementById("chartCanvas").getContext("2d");
      if (myChart) {
        myChart.destroy();
      }

      myChart = new Chart(ctx, {
        type: "bar", // Bar chart type
        data: {
          labels: productNames,
          datasets: [
            {
              label: "Total Sales",
              data: productSales,
              backgroundColor: [
                "rgba(75, 192, 192, 0.6)",
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(255, 99, 132, 0.6)",
              ],
              borderColor: [
                "rgba(75, 192, 192, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(255, 99, 132, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      // Render Revenue Line Chart
      const rvctx = document.getElementById("revenueChart").getContext("2d");
      new Chart(rvctx, {
        type: "line", // Line chart type
        data: {
          labels: labels,
          datasets: [{
            label: "Daily Revenue",
            data: salesData, // Total sales data for line chart
            borderColor: "rgba(75, 192, 192, 1)", 
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true, position: 'top' },
          },
          scales: {
            x: { 
              title: { display: true, text: "Date" }
            },
            y: { 
              title: { display: true, text: "Revenue (₹)" } 
            }
          }
        }
      });

      
      switchChart("product");
    }
  } catch (error) {
    console.error("Error fetching report data:", error.message);
  }
}

function switchChart(chartType) {
  if (chartType === "product") {
    myChart.data.labels = productNames;
    myChart.data.datasets[0].data = productSales;
    document.getElementById("chartTitle").innerText = "Top Selling Products";
  } else if (chartType === "category") {
    myChart.data.labels = categoryNames;
    myChart.data.datasets[0].data = categorySales;
    document.getElementById("chartTitle").innerText = "Top Selling Categories";
  }

  // Re-render the chart
  myChart.update();
}

document.querySelectorAll('input[name="chartType"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    switchChart(event.target.value);
  });
});

window.onload = function () {
  generateReport();
};
