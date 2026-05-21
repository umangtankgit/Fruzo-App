import jsPDF from "jspdf";
// YAHAN IMPORT CHANGE KIYA HAI
import autoTable from "jspdf-autotable"; 

export const generateInvoice = (order) => {
    const doc = new jsPDF();

    // ==========================================
    // 1. BRANDING & HEADER 
    // ==========================================
    doc.setFontSize(24);
    doc.setTextColor(76, 175, 80); 
    doc.setFont("helvetica", "bold");
    doc.text("FRUZO", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("Tax Invoice / Bill of Supply", 14, 28);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 32, 196, 32);

    // ==========================================
    // 2. ORDER & CUSTOMER INFO
    // ==========================================
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.setFont("helvetica", "bold");
    doc.text("Order Information:", 14, 42);
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: ${order._id}`, 14, 48);
    const orderDate = new Date(order.createdAt).toLocaleDateString();
    doc.text(`Order Date: ${orderDate}`, 14, 54);
    doc.text(`Payment Method: ${order.paymentType || 'N/A'}`, 14, 60);

    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", 120, 42);
    doc.setFont("helvetica", "normal");
    
    const customerName = order.address?.firstName ? `${order.address.firstName} ${order.address.lastName || ''}` : "Customer";
    doc.text(customerName, 120, 48);
    doc.text(order.address?.street || "N/A", 120, 54);
    doc.text(`${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.zipcode || ''}`, 120, 60);
    if (order.address?.phone) doc.text(`Phone: ${order.address.phone}`, 120, 66);

    // ==========================================
    // 3. PRODUCT TABLE
    // ==========================================
    const tableColumn = ["S.No", "Product Name", "Quantity", "Price", "Total"];
    const tableRows = [];

    order.items.forEach((item, index) => {
        const itemName = item.product?.name || "Product";
        const itemPrice = item.product?.offerPrice || 0;
        const total = item.quantity * itemPrice;

        tableRows.push([
            index + 1,
            itemName,
            item.quantity,
            `Rs. ${itemPrice}`,
            `Rs. ${total}`
        ]);
    });

    // YAHAN FUNCTION CALL CHANGE KIYA HAI (autoTable ko separately pass kiya hai)
    autoTable(doc, {
        startY: 75,
        head: [tableColumn],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [76, 175, 80], textColor: [255, 255, 255] },
        styles: { fontSize: 10, cellPadding: 4 },
    });

    // ==========================================
    // 4. TOTALS & FOOTER
    // ==========================================
    const finalY = doc.lastAutoTable.finalY || 100;
    
    const baseAmount = Math.round(order.amount / 1.02);
    const taxAmount = order.amount - baseAmount;

    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal: Rs. ${baseAmount}`, 140, finalY + 10);
    doc.text(`Tax (2%): Rs. ${taxAmount}`, 140, finalY + 16);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(76, 175, 80);
    doc.text(`Grand Total: Rs. ${order.amount}`, 140, finalY + 24);

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for shopping with Fruzo! This is a computer-generated invoice.", 14, 280);

    // Trigger Browser Download
    doc.save(`Fruzo_Invoice_${order._id}.pdf`);
};