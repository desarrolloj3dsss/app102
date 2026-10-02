// Stock App - JavaScript functionality

// DOM Elements
const productsTableBody = document.getElementById('productsTableBody');
const clientsTableBody = document.getElementById('clientsTableBody');
const clientSelect = document.getElementById('clientSelect');
const productSelect = document.getElementById('productSelect');
const cartTableBody = document.getElementById('cartTableBody');
const productForm = document.getElementById('productForm');
const clientForm = document.getElementById('clientForm');
const saleForm = document.getElementById('saleForm');
const addToCartBtn = document.getElementById('addToCartBtn');
const processSaleBtn = document.getElementById('processSaleBtn');
const subtotalEl = document.getElementById('subtotal');
const interestEl = document.getElementById('interest');
const totalEl = document.getElementById('total');

// Data storage (in a real app, this would be in a database)
let products = [];
let clients = [];
let cart = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadSampleData();
    renderProducts();
    renderClients();
    renderClientSelect();
    renderProductSelect();
    updateCart();
    
    // Event listeners
    productForm.addEventListener('submit', handleProductSubmit);
    clientForm.addEventListener('submit', handleClientSubmit);
    saleForm.addEventListener('submit', handleSaleSubmit);
    addToCartBtn.addEventListener('click', addToCart);
});

// Load sample data
function loadSampleData() {
    // Sample products
    products = [
        { id: 1, code: 'PROD001', description: 'Producto A', cost: 10.00, price: 15.00, stock: 100 },
        { id: 2, code: 'PROD002', description: 'Producto B', cost: 20.00, price: 30.00, stock: 50 },
        { id: 3, code: 'PROD003', description: 'Producto C', cost: 5.00, price: 8.00, stock: 200 }
    ];
    
    // Sample clients
    clients = [
        { id: 1, name: 'Cliente 1', debt: 0.00 },
        { id: 2, name: 'Cliente 2', debt: 50.00 },
        { id: 3, name: 'Cliente 3', debt: 0.00 }
    ];
}

// Render products table
function renderProducts() {
    productsTableBody.innerHTML = '';
    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.code}</td>
            <td>${product.description}</td>
            <td>$${product.cost.toFixed(2)}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editProduct(${product.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${product.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        productsTableBody.appendChild(tr);
    });
}

// Render clients table
function renderClients() {
    clientsTableBody.innerHTML = '';
    clients.forEach(client => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${client.name}</td>
            <td>$${client.debt.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editClient(${client.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteClient(${client.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        clientsTableBody.appendChild(tr);
    });
}

// Render client select dropdown
function renderClientSelect() {
    clientSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = `${client.name} (Deuda: $${client.debt.toFixed(2)})`;
        if (client.debt > 0) {
            option.style.color = 'red';
            option.style.fontWeight = 'bold';
        }
        clientSelect.appendChild(option);
    });
}

// Render product select dropdown
function renderProductSelect() {
    productSelect.innerHTML = '<option value="">Seleccione un producto</option>';
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.description} (${product.code}) - Stock: ${product.stock}`;
        productSelect.appendChild(option);
    });
}

// Handle product form submission
function handleProductSubmit(e) {
    e.preventDefault();
    
    const code = document.getElementById('productCode').value.trim();
    const description = document.getElementById('productDesc').value.trim();
    const cost = parseFloat(document.getElementById('productCost').value);
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    
    if (!code || !description || isNaN(cost) || isNaN(price) || isNaN(stock)) {
        alert('Por favor complete todos los campos');
        return;
    }
    
    // Check if product code already exists
    if (products.some(p => p.code === code)) {
        alert('Ya existe un producto con ese código');
        return;
    }
    
    const newProduct = {
        id: Date.now(), // Simple ID generation
        code,
        description,
        cost,
        price,
        stock
    };
    
    products.push(newProduct);
    renderProducts();
    renderProductSelect();
    
    // Close modal and reset form
    const productModal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    productModal.hide();
    productForm.reset();
}

// Handle client form submission
function handleClientSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('clientName').value.trim();
    const debt = parseFloat(document.getElementById('clientDebt').value);
    
    if (!name || isNaN(debt)) {
        alert('Por favor complete todos los campos');
        return;
    }
    
    const newClient = {
        id: Date.now(), // Simple ID generation
        name,
        debt
    };
    
    clients.push(newClient);
    renderClients();
    renderClientSelect();
    
    // Close modal and reset form
    const clientModal = bootstrap.Modal.getInstance(document.getElementById('clientModal'));
    clientModal.hide();
    clientForm.reset();
}

// Handle adding product to cart
function addToCart() {
    const productId = parseInt(productSelect.value);
    const quantity = parseInt(document.getElementById('quantity').value);
    
    if (isNaN(productId) || isNaN(quantity) || quantity <= 0) {
        alert('Por favor seleccione un producto y cantidad válida');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        alert('Producto no encontrado');
        return;
    }
    
    if (quantity > product.stock) {
        alert(`No hay suficiente stock. Disponible: ${product.stock}`);
        return;
    }
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.product.id === productId);
    if (existingItem) {
        // Update quantity if stock allows
        if (existingItem.quantity + quantity <= product.stock) {
            existingItem.quantity += quantity;
        } else {
            alert(`No hay suficiente stock para agregar esa cantidad. Disponible: ${product.stock - existingItem.quantity}`);
            return;
        }
    } else {
        // Add new item to cart
        cart.push({ product, quantity });
    }
    
    updateCart();
    // Reset quantity input
    document.getElementById('quantity').value = 1;
}

// Update cart table and summary
function updateCart() {
    cartTableBody.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const subtotalItem = item.product.price * item.quantity;
        subtotal += subtotalItem;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.product.description}</td>
            <td>${item.quantity}</td>
            <td>$${item.product.price.toFixed(2)}</td>
            <td>$${subtotalItem.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="updateCartQuantity(${index}, ${item.quantity - 1})">
                    <i class="bi bi-dash"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="updateCartQuantity(${index}, ${item.quantity + 1})">
                    <i class="bi bi-plus"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        cartTableBody.appendChild(tr);
    });
    
    // Calculate interest (10% for credit sales)
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const interest = paymentMethod === 'credit' ? subtotal * 0.10 : 0;
    const total = subtotal + interest;
    
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    interestEl.textContent = `$${interest.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
}

// Update cart quantity
function updateCartQuantity(index, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(index);
        return;
    }
    
    const item = cart[index];
    if (newQuantity > item.product.stock) {
        alert(`No hay suficiente stock. Disponible: ${item.product.stock}`);
        return;
    }
    
    item.quantity = newQuantity;
    updateCart();
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Handle sale form submission
function handleSaleSubmit(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    const clientId = parseInt(clientSelect.value);
    if (isNaN(clientId)) {
        alert('Por favor seleccione un cliente');
        return;
    }
    
    const client = clients.find(c => c.id === clientId);
    if (!client) {
        alert('Cliente no encontrado');
        return;
    }
    
    // Calculate totals
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.product.price * item.quantity;
    });
    
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const interest = paymentMethod === 'credit' ? subtotal * 0.10 : 0;
    const total = subtotal + interest;
    
    // Update client debt if credit sale
    if (paymentMethod === 'credit') {
        client.debt += total;
        
        // Check if over 15 days (simplified - in real app would check date)
        // For demo, we'll just add the extra 5% if debt was already > 0
        if (client.debt - total > 0) { // Had previous debt
            const extraInterest = subtotal * 0.05; // Additional 5%
            client.debt += extraInterest;
            // Update interest display to show both
            interestEl.textContent = `$${(interest + extraInterest).toFixed(2)}`;
            totalEl.textContent = `$${(subtotal + interest + extraInterest).toFixed(2)}`;
        }
    }
    
    // Update product stock
    cart.forEach(item => {
        const product = products.find(p => p.id === item.product.id);
        if (product) {
            product.stock -= item.quantity;
        }
    });
    
    // Generate PDF receipt (simplified)
    generateReceipt(client, cart, subtotal, interest, total, paymentMethod);
    
    // Reset form
    cart = [];
    updateCart();
    clientSelect.value = '';
    renderClients();
    renderProducts();
    renderClientSelect();
    renderProductSelect();
    
    alert('Venta procesada correctamente. Se ha generado el recibo.');
}

// Generate PDF receipt (simplified version)
function generateReceipt(client, items, subtotal, interest, total, paymentMethod) {
    // In a real app, we would use a proper PDF library
    // For this demo, we'll just show an alert with the receipt data
    
    let receiptData = `STOCK APP - RECIBO DE VENTA\n`;
    receiptData += `=============================\n\n`;
    receiptData += `Cliente: ${client.name}\n`;
    receiptData += `Fecha: ${new Date().toLocaleString()}\n`;
    receiptData += `Método de pago: ${paymentMethod === 'credit' ? 'Crédito' : 'Contado'}\n\n`;
    receiptData += `PRODUCTOS:\n`;
    receiptData += `-----------------------------\n`;
    
    items.forEach(item => {
        receiptData += `${item.product.description}\n`;
        receiptData += `  Cantidad: ${item.quantity} x $${item.product.price.toFixed(2)} = $${(item.product.price * item.quantity).toFixed(2)}\n`;
        receiptData += `  Código: ${item.product.code}\n\n`;
    });
    
    receiptData += `-----------------------------\n`;
    receiptData += `Subtotal: $${subtotal.toFixed(2)}\n`;
    if (paymentMethod === 'credit') {
        receiptData += `Interés (10%): $${interest.toFixed(2)}\n`;
    }
    receiptData += `TOTAL: $${total.toFixed(2)}\n\n`;
    receiptData += `¡Gracias por su compra!\n`;
    receiptData += `Conserve este comprobante para cualquier reclamo.\n`;
    
    // Show receipt in a popup
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`<pre>${receiptData}</pre>`);
    receiptWindow.document.close();
    
    // In a real app, we would actually generate and download a PDF
    // For now, we'll just show the data
    alert('Recibo generado (en una aplicación real, se descargaría como PDF)\n\n' + receiptData);
}

// Edit product (simplified)
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('productCode').value = product.code;
    document.getElementById('productDesc').value = product.description;
    document.getElementById('productCost').value = product.cost;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    
    // Change form to update mode (simplified - in real app would have update logic)
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    productModal.show();
    
    // We'd need to modify the form to handle updates vs creates
    // For simplicity, we'll just note this is for editing
    alert('En una aplicación completa, esto abriría el formulario para editar el producto\n\nPor ahora, puede modificar los valores y agregar como nuevo producto');
}

// Edit client (simplified)
function editClient(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    
    document.getElementById('clientName').value = client.name;
    document.getElementById('clientDebt').value = client.debt;
    
    const clientModal = new bootstrap.Modal(document.getElementById('clientModal'));
    clientModal.show();
    
    alert('En una aplicación completa, esto abriría el formulario para editar el cliente\n\nPor ahora, puede modificar los valores y agregar como nuevo cliente');
}

// Delete product
function deleteProduct(id) {
    if (!confirm('¿Está seguro de eliminar este producto?')) return;
    
    products = products.filter(p => p.id !== id);
    renderProducts();
    renderProductSelect();
}

// Delete client
function deleteClient(id) {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;
    
    clients = clients.filter(c => c.id !== id);
    renderClients();
    renderClientSelect();
}