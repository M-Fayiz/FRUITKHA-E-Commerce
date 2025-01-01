const quickFilter = document.getElementById("quickFilter");
    const costumDate = document.getElementById("costumDate");

    
    quickFilter.addEventListener("change", function () {
        if (this.value === "custom") {
            costumDate.style.display = "flex"; 
        } else {
            costumDate.style.display = "none"; 
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
            
            