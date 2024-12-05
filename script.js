document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.tab-content');

    // Leer la pestaña activa desde localStorage o establecer "inquilinos" como predeterminada
    const activeTab = localStorage.getItem('activeTab') || 'inquilinos';
    setActiveTab(activeTab);

    // Cambiar entre pestañas
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            setActiveTab(target);
            localStorage.setItem('activeTab', target); // Guardar la pestaña activa
        });
    });

    // Función para activar la pestaña y mostrar solo su contenido
    function setActiveTab(tabName) {
        tabs.forEach(tab => tab.classList.remove('active')); // Desactivar todas las pestañas
        sections.forEach(section => section.classList.remove('active')); // Ocultar todas las secciones

        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedSection = document.getElementById(tabName);

        if (selectedTab && selectedSection) {
            selectedTab.classList.add('active'); // Activar pestaña seleccionada
            selectedSection.classList.add('active'); // Mostrar sección seleccionada
        }
    }

    // *** Expensas ***
    const montosExpensas = JSON.parse(localStorage.getItem('montosExpensas')) || {};

    const renderMontosExpensas = () => {
    const lista = document.getElementById('montos-expensas-lista');
    lista.innerHTML = ''; // Limpiar lista antes de renderizar
    Object.keys(montosExpensas).forEach(categoria => {
        const monto = parseFloat(montosExpensas[categoria]);
        const montoFormateado = isNaN(monto) ? '0' : monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

        lista.innerHTML += `
            <tr>
                <td>${categoria}</td>
                <td>${montoFormateado}</td>
                <td>
                    <button class="btn-edit-expensa" data-categoria="${categoria}">Editar</button>
                    <button class="btn-delete-expensa" data-categoria="${categoria}">Eliminar</button>
                </td>
            </tr>`;
    });
};


    document.getElementById('expensas-monto-form').addEventListener('submit', e => {
    e.preventDefault();
    const categoria = document.getElementById('categoria-expensa').value.trim();
    const monto = parseFloat(document.getElementById('monto-expensa').value.trim());

    if (categoria && !isNaN(monto) && monto > 0) { // Verifica que el monto sea un número válido y mayor a 0
        montosExpensas[categoria] = monto;
        localStorage.setItem('montosExpensas', JSON.stringify(montosExpensas));
        renderMontosExpensas();
        renderExpensasParaCobro(); // Renderizar expensas generales
        renderExpensasParaCobroEspecifico(); // Renderizar expensas específicas
        e.target.reset();
    } else {
        alert("Por favor, ingrese un monto válido.");
    }
});



    document.getElementById('montos-expensas-lista').addEventListener('click', e => {
    if (e.target.classList.contains('btn-delete-expensa')) {
        const categoria = e.target.dataset.categoria;

        // Eliminar expensa del objeto de expensas
        delete montosExpensas[categoria];
        localStorage.setItem('montosExpensas', JSON.stringify(montosExpensas));

        // Volver a renderizar las listas de expensas y cobros
        renderMontosExpensas();
        renderExpensasParaCobro(); // Renderizar expensas generales
        renderExpensasParaCobroEspecifico(); // Renderizar expensas específicas
    } else if (e.target.classList.contains('btn-edit-expensa')) {
        const categoria = e.target.dataset.categoria;
        const nuevoMonto = prompt(`Editar monto para ${categoria}:`, montosExpensas[categoria]);
        if (nuevoMonto !== null && !isNaN(nuevoMonto)) {
            montosExpensas[categoria] = parseFloat(nuevoMonto);
            localStorage.setItem('montosExpensas', JSON.stringify(montosExpensas));
            renderMontosExpensas();
            renderExpensasParaCobro(); // Renderizar expensas generales
            renderExpensasParaCobroEspecifico(); // Renderizar expensas específicas
        }
    }
});

    // *** Cobros Generales ***
    const cobros = JSON.parse(localStorage.getItem('cobros')) || [];

    // Renderizar las expensas disponibles para los inquilinos generales con checkboxes
// Renderizar las expensas disponibles para los inquilinos generales con checkboxes
const renderExpensasParaCobro = () => {
    const expensas = JSON.parse(localStorage.getItem('montosExpensas')) || {};
    const listaExpensas = document.getElementById('expensas-cobro-lista');
    listaExpensas.innerHTML = ''; // Limpiar antes de renderizar

    Object.keys(expensas).forEach((categoria) => {
        const monto = parseFloat(expensas[categoria]);
        const montoFormateado = isNaN(monto) ? '0' : monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

        listaExpensas.innerHTML += `
            <div class="checkbox-container">
                <div class="expensa-info">
                    <span class="categoria">${categoria}</span>
                    <span class="monto">${montoFormateado}</span>
                </div>
                <input type="checkbox" id="expensa-${categoria}" data-categoria="${categoria}" data-monto="${monto}" class="expensa-checkbox">
            </div>
        `;
    });
};

    // Calcular el total de cobros generales y dividir entre 6
    const calcularTotalCobro = () => {
    let total = 0;
    const checkboxes = document.querySelectorAll('.expensa-checkbox:checked');

    // Recorre los checkboxes y acumula los montos
    checkboxes.forEach((checkbox) => {
        const monto = parseFloat(checkbox.dataset.monto);
        if (!isNaN(monto)) {
            total += monto;
        }
    });

    // Asegúrate de que haya un valor válido antes de dividir
    if (total > 0) {
        total = total / 6;
    } else {
        total = 0; // Si no hay expensas seleccionadas, el total debe ser 0
    }

    // Mostrar el total en formato de moneda
    document.getElementById('total-cobro').value = total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
};



    // Calcular el total de cobros específicos
const calcularTotalCobroEspecifico = () => {
    let total = 0;
    const checkboxes = document.querySelectorAll('.expensa-especifico-checkbox:checked');
    const inquilino = document.getElementById('inquilino-cobro-especifico').value;

    // Recorre los checkboxes seleccionados y calcula el monto basado en el inquilino
    checkboxes.forEach((checkbox) => {
        const categoria = checkbox.dataset.categoria;
        const monto = parseFloat(checkbox.dataset.monto);

        if (!isNaN(monto)) {
            let montoCalculado = monto; // Inicializar el monto a calcular

            // Aplicar las reglas según el inquilino seleccionado
            if (inquilino === 'Javier') {
                if (categoria === 'AYSA') {
                    montoCalculado = monto / 2; // Mitad de AYSA
                } else if (categoria === 'ABL') {
                    montoCalculado = monto / 4; // Un cuarto de ABL
                } else if (categoria === 'Administración') {
                    montoCalculado = monto / 9; // Una novena parte de Administración
                }
            } else if (inquilino === 'Valeria') {
                if (categoria === 'Luz') {
                    montoCalculado = monto / 2; // Mitad de Luz
                } else if (categoria === 'AYSA') {
                    montoCalculado = monto / 4; // Un cuarto de AYSA
                } else if (categoria === 'Administración') {
                    montoCalculado = monto / 9; // Una novena parte de Administración
                } else if (categoria.includes('Fondo')) {
                    montoCalculado = monto / 2; // Fondo se divide en 2 (si aplica)
                }
            } else if (inquilino === 'Diego') {
                if (categoria === 'Luz') {
                    montoCalculado = monto / 2; // Mitad de Luz
                } else if (categoria === 'AYSA') {
                    montoCalculado = monto / 4; // Un cuarto de AYSA
                } else if (categoria === 'WiFi') {
                    montoCalculado = monto; // Agregar el monto completo de WiFi
                } else if (categoria === 'Administración') {
                    montoCalculado = monto / 9; // Una novena parte de Administración
                } else if (categoria.includes('Fondo')) {
                    montoCalculado = monto / 2; // Fondo se divide en 2 (si aplica)
                }
            }

            // Sumar el monto calculado al total
            total += montoCalculado;

            // Mostrar los valores para debug
            console.log(`Inquilino: ${inquilino}, Categoría: ${categoria}, Monto Original: ${monto}, Monto Calculado: ${montoCalculado}`);
        }
    });

    // Asegúrate de que el total sea positivo y muestra el valor en formato de moneda
    total = total > 0 ? total : 0;

    // Al final, formatea el total a moneda
    document.getElementById('total-cobro-especifico').value = total.toFixed(2);
};










    // Escuchar los cambios en las expensas seleccionadas para recalcular el total general
    document.getElementById('expensas-cobro-lista').addEventListener('change', (e) => {
        if (e.target.classList.contains('expensa-checkbox')) {
            calcularTotalCobro();
        }
    });

    // Registrar el cobro general
    document.getElementById('cobro-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const inquilino = document.getElementById('inquilino-cobro').value;
    const checkboxes = document.querySelectorAll('.expensa-checkbox:checked');
    const expensasSeleccionadas = [];
    let total = 0;

    // Recorre los checkboxes seleccionados y suma los montos
    checkboxes.forEach((checkbox) => {
        const monto = parseFloat(checkbox.dataset.monto);
        if (!isNaN(monto)) {
            total += monto;
            expensasSeleccionadas.push(`${checkbox.dataset.categoria} ($${monto})`);
        }
    });

    // Dividir el total entre 6 y formatearlo
    if (total > 0) {
        total = total / 6;
    }

    // Asegúrate de que el total esté siempre en formato numérico
    total = parseFloat(total.toFixed(2));

    // Registrar el cobro solo si tiene un valor válido
    if (inquilino && expensasSeleccionadas.length > 0 && !isNaN(total) && total > 0) {
        cobros.push({
            inquilino,
            expensas: expensasSeleccionadas,
            total: total // Guarda el total como número
        });
        localStorage.setItem('cobros', JSON.stringify(cobros));
        renderCobros();
        e.target.reset(); // Limpiar el formulario
        document.getElementById('total-cobro').value = ''; // Limpiar el total
    } else {
        alert("Por favor, selecciona al menos una expensa y asegúrate de que el total sea válido.");
    }
});

    // *** Renderizar Cobros Generales y Específicos ***
    const renderCobros = () => {
    const listaCobros = document.getElementById('cobros-lista');
    listaCobros.innerHTML = ''; // Limpiar lista antes de renderizar
    cobros.forEach((cobro, index) => {
        const totalFormateado = !isNaN(parseFloat(cobro.total)) 
            ? parseFloat(cobro.total).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) 
            : '$0,00';
        
        listaCobros.innerHTML += `
            <tr>
                <td>${cobro.inquilino}</td>
                <td>${cobro.expensas.join(', ')}</td>
                <td>${totalFormateado}</td>
                <td>
                    <button class="btn-delete-cobro" data-index="${index}">Eliminar</button>
                </td>
            </tr>`;
    });
};



    document.getElementById('cobros-lista').addEventListener('click', e => {
        if (e.target.classList.contains('btn-delete-cobro')) {
            const index = e.target.dataset.index;
            cobros.splice(index, 1);
            localStorage.setItem('cobros', JSON.stringify(cobros));
            renderCobros();
        }
    });

// Renderizar las expensas disponibles para los inquilinos con cobros específicos con checkboxes
const renderExpensasParaCobroEspecifico = () => {
    const expensas = JSON.parse(localStorage.getItem('montosExpensas')) || {};
    console.log("Datos de expensas cargados: ", expensas);
    
    const listaExpensas = document.getElementById('expensas-cobro-especifico-lista');
    listaExpensas.innerHTML = ''; // Limpiar antes de renderizar

    Object.keys(expensas).forEach((categoria) => {
        const monto = parseFloat(expensas[categoria]);
        
        if (!isNaN(monto)) {
            // Renderizar solo las expensas que corresponden
            listaExpensas.innerHTML += `
                <div class="checkbox-container">
                    <div class="expensa-info">
                        <span class="categoria">${categoria}</span>
                        <span class="monto">$${monto.toLocaleString('es-AR')}</span>
                    </div>
                    <input type="checkbox" id="expensa-especifico-${categoria}" data-categoria="${categoria}" data-monto="${monto}" class="expensa-especifico-checkbox">
                </div>
            `;
        }
    });
};




// Escuchar los cambios en las expensas seleccionadas para recalcular el total específico
document.getElementById('expensas-cobro-especifico-lista').addEventListener('change', (e) => {
    if (e.target.classList.contains('expensa-especifico-checkbox')) {
        calcularTotalCobroEspecifico();
    }
});

// Registrar el cobro específico
document.getElementById('cobro-especifico-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const inquilino = document.getElementById('inquilino-cobro-especifico').value;
    const checkboxes = document.querySelectorAll('.expensa-especifico-checkbox:checked');
    const expensasSeleccionadas = [];
    
    // Recorre los checkboxes seleccionados y agrega la descripción de la expensa
    checkboxes.forEach((checkbox) => {
        expensasSeleccionadas.push(`${checkbox.dataset.categoria} ($${checkbox.dataset.monto})`);
    });

    // Obtén el total desde el campo, eliminando caracteres no numéricos y convirtiendo a número
    let totalString = document.getElementById('total-cobro-especifico').value.replace(/[^0-9.,-]+/g, '').replace(',', '.');
    let total = parseFloat(totalString);

    // Registrar el cobro solo si tiene un valor válido
    if (inquilino && expensasSeleccionadas.length > 0 && !isNaN(total) && total > 0) {
        cobros.push({
            inquilino,
            expensas: expensasSeleccionadas,
            total: total // Guarda el total como número
        });
        localStorage.setItem('cobros', JSON.stringify(cobros));
        renderCobros(); // Renderizar los cobros registrados
        e.target.reset(); // Limpiar el formulario
        document.getElementById('total-cobro-especifico').value = ''; // Limpiar el total específico
    } else {
        alert("Por favor, selecciona al menos una expensa y asegúrate de que el total sea válido.");
    }
});


    // Render inicial
    renderMontosExpensas();
    renderCobros();
    renderExpensasParaCobro();
    renderExpensasParaCobroEspecifico();
});
