    
            async function generateReport() {
                const startDate = document.getElementById('startDate').value;
                const endDate = document.getElementById('endDate').value;
                const quickFilter = document.getElementById('quickFilter').value;
              
                if ((startDate && endDate) && quickFilter !== 'select') {
                    showToast('Please select either a date range (Start Date and End Date) or a Quick Filter, but not both.');
                    return;
                }
            
                try {
                    const response = await fetch('/admin/get-sales-report', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ startDate, endDate, quickFilter }),
                    });
            
                    const result = await response.json();
            
                    if (result.success) {
                        const { metrics, orders } = result.data;
            
                       
            
                        
                       
                        localStorage.setItem('salesReportMetrics', JSON.stringify(metrics));
                        localStorage.setItem('salesReportOrders', JSON.stringify(orders));
            
                    
                        updateMetrics(metrics);
                      
                        updateTable(orders);
                    } else {
                        alert('Failed to generate report.');
                    }
                } catch (error) {
                    console.error('Error generating report:', error);
                    alert('Error generating report.');
                }
            }
            
            function updateMetrics(metrics) {
                document.getElementById('overallSalesCount').innerText = metrics.totalOrders;
                document.getElementById('overallOrderAmount').innerText = `₹${metrics.totalOrderAmount.toFixed(2)}`;
                document.getElementById('overallDiscount').innerText = `₹${metrics.totalDiscounts.toFixed(2)}`;
            }
            
            function updateTable(orders) {
                const table = document.getElementById('salesReportTable');
                table.innerHTML = orders.map((order, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>${order._id}</td>
                        <td>${order.UserID.firstName}</td> <!-- User's name -->
                       
                        <td>₹${order.Final_Amount.toFixed(2)}</td>
                        <td>₹${order.Coupon.discountValue.toFixed(2)}</td>
                        <td>${order.payment}</td>
                        <td>${order.orderStatus}</td>
                        <td>${order.paymentStatus}</td>
                    </tr>
                `).join('');
            }
            document.addEventListener('DOMContentLoaded', () => {
                const storedMetrics = localStorage.getItem('salesReportMetrics');
                const storedOrders = localStorage.getItem('salesReportOrders');
            
                if (storedMetrics && storedOrders) {
                    const metrics = JSON.parse(storedMetrics);
                    const orders = JSON.parse(storedOrders);
            
                    // Update metrics and table with the stored data
                    updateMetrics(metrics);
                    updateTable(orders);
                }
            });
            
            
            
                    function downloadExcel() {
                        
                        var table = document.getElementById("pdfLoad");
                        var wb = XLSX.utils.table_to_book(table, {sheet: "Sheet1"});
                        XLSX.writeFile(wb, "data.xlsx");
                    
                    }
            
                    
                       
            const downloadButton = document.getElementById('downloadButton');
            
            
            downloadButton.addEventListener('click', function () {
                const pdfContainer = document.createElement('div');
                pdfContainer.style.padding = '20px'; 
               
                const startDate = document.getElementById('startDate').value;
                const endDate = document.getElementById('endDate').value;
                const quickFilter = document.getElementById('quickFilter').value;
            
                const today = new Date();
                const formattedToday = today.toLocaleDateString('en-GB'); 
            
                const dateParagraph = document.createElement('p');
                dateParagraph.style.textAlign = 'right';
                dateParagraph.style.fontSize = '14px';
            
                
                if (startDate && endDate) {
                 
                    const formattedStartDate = new Date(startDate).toLocaleDateString('en-GB');
                    const formattedEndDate = new Date(endDate).toLocaleDateString('en-GB');
                    dateParagraph.innerText = `Report from: ${formattedStartDate} to ${formattedEndDate}`;
                } else if (quickFilter === '1Day') {
                    dateParagraph.innerText = `Report Date: ${formattedToday}`;
                } else if (quickFilter === '1Week') {
                    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const formattedWeekAgo = oneWeekAgo.toLocaleDateString('en-GB');
                    dateParagraph.innerText = `Report: Week Ending ${formattedToday} (From ${formattedWeekAgo})`;
                } else {
                    dateParagraph.innerText = `Report Date: ${formattedToday}`;
                }
            
                
                pdfContainer.appendChild(dateParagraph);
            
                const tableElement = document.getElementById('pdfLoad'); 
                const clonedTable = tableElement.cloneNode(true);
                pdfContainer.appendChild(clonedTable);
            
                
                html2pdf(pdfContainer, {
                    margin: 10,
                    filename: `sales_report_${formattedToday}.pdf`,
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                });
            
            
            });
            
            