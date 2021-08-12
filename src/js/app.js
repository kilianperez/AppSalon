let pagina = 1;
const cita = {
	nombre: '',
	fecha: '',
	hora: '',
	servicios: [],
};
document.addEventListener('DOMContentLoaded', function () {
	iniciarApp();
});
function iniciarApp() {
	mostrarServicios();

	// resaltar el tab presionado y la sección
	mostrarSeccion();
	// ocultar o mostrar una sección según el tab presionado
	cambiarSeccion();

	// Paginación
	paginaSiguiente();
	paginaAnterior();

	// Comprobar páginas para ocultar o mostrar los botones
	botonesPaginacion();

	// muestra resultado resumen de la cita o mensaje de error si no valida
	mostrarResumen();

	// almacenar el nombre de la cita en el objeto
	nombreCita();

	// almacenar el fecha de la cita en el objeto
	fechaCita();

	// deshabilitar dias pasados
	deshabilitarfechaAnterior();

	// Almacenar hora de la cita en el objeto
	horaCita();
}

function mostrarSeccion() {
	// Eliminar secciones de
	const seccionAnterior = document.querySelector('.mostrar-seccion');
	if (seccionAnterior) {
		seccionAnterior.classList.remove('mostrar-seccion');
	}

	const seccionActual = document.querySelector(`#paso-${pagina}`);
	seccionActual.classList.add('mostrar-seccion');

	// Eliminar la clase de seleccionado en el tab anterior
	const tabAnterior = document.querySelector('.tabs button.seleccionado');
	if (tabAnterior) {
		tabAnterior.classList.remove('seleccionado');
	}
	// resaltar tab actual
	const tab = document.querySelector(`[data-paso="${pagina}"]`);
	tab.classList.add('seleccionado');
}
function cambiarSeccion() {
	const enlaces = document.querySelectorAll('.tabs button');

	enlaces.forEach((enlace) => {
		enlace.addEventListener('click', (e) => {
			e.preventDefault();

			// cambiar el data-paso a un num entero
			pagina = parseInt(e.target.dataset.paso);
			// console.log(pagina);

			// llamar la función de mostrar seccion
			mostrarSeccion();

			botonesPaginacion();
		});
	});
}
async function mostrarServicios() {
	try {
		const resultado = await fetch('./servicios.json');
		const db = await resultado.json();
		const {servicios} = db;
		// console.log(resultado);
		servicios.forEach((servicio) => {
			// console.log(servicio);
			const {id, nombre, precio} = servicio;

			// DOM Scripting
			const nombreServicio = document.createElement('P');
			nombreServicio.textContent = nombre;
			nombreServicio.classList.add('nombre-servicio');
			// console.log(nombreServicio);

			const precioServio = document.createElement('P');
			precioServio.textContent = `${precio} €`;
			precioServio.classList.add('nombre-precio');
			// console.log(precioServio);

			// generar div contenedor de info
			const servicioDiv = document.createElement('DIV');
			servicioDiv.classList.add('servicio');
			servicioDiv.dataset.idServicio = id;

			// seleccionar un servicio para la cita
			servicioDiv.onclick = selecionarServicio;

			// inyectar precio y nombre en el serviciosDiv
			servicioDiv.appendChild(nombreServicio);
			servicioDiv.appendChild(precioServio);
			// console.log(servicioDiv);

			// Inyectarlo en el HTML
			document.querySelector('#servicios').appendChild(servicioDiv);
		});
	} catch (error) {
		// console.log(error);
	}
}

function selecionarServicio(e) {
	// console.log('click en el servicio');
	// const id = e.target.dataset.id

	// forzar el click solo en el div y no en el párrafo
	let elemento;
	if (e.target.tagName === 'P') {
		// console.log('click en el parrafo');
		// console.log(e.target.parentElement);
		elemento = e.target.parentElement;
	} else {
		// console.log('click en el DIV');
		elemento = e.target;
		// console.log(e.target);
	}

	// saber si el elemento esta seleccionado
	if (elemento.classList.contains('selecionado')) {
		// console.log('esta selecionado y lo quita');
		elemento.classList.remove('selecionado');
		const id = parseInt(elemento.dataset.idServicio);

		eliminarServicio(id);
	} else {
		// console.log('no esta seleccionado y lo pone');
		elemento.classList.add('selecionado');

		// console.log(elemento.dataset.idServicio);
		// console.log(elemento.firstElementChild.textContent);
		// console.log(elemento.firstElementChild.nextElementSibling.textContent);
		const servicioObj = {
			id: parseInt(elemento.dataset.idServicio),
			nombre: elemento.firstElementChild.textContent,
			precio: elemento.firstElementChild.nextElementSibling.textContent,
		};

		// console.log(servicioObj);
		agregarServicio(servicioObj);
	}
}
function eliminarServicio(id) {
	// console.log('eliminando servicio...', id);
	const {servicios} = cita;

	// eliminar los que sean diferentes en id
	cita.servicios = servicios.filter((servicio) => servicio.id !== id);

	// console.log(cita);
}

function agregarServicio(objeto) {
	// console.log('agregando servicio...');
	const {servicios} = cita;

	// agregar los servicios al objeto
	cita.servicios = [...servicios, objeto];

	// console.log(cita);
}

function paginaSiguiente() {
	// console.log('pagina siguiente');
	const paginaSiguiente = document.querySelector('#siguiente');
	paginaSiguiente.addEventListener('click', () => {
		pagina++;
		botonesPaginacion();
	});
}

function paginaAnterior() {
	// console.log('pagina anterior');
	const paginaAnterior = document.querySelector('#anterior');

	paginaAnterior.addEventListener('click', () => {
		pagina--;
		botonesPaginacion();
	});
}
function botonesPaginacion() {
	const paginaSiguiente = document.querySelector('#siguiente');
	const paginaAnterior = document.querySelector('#anterior');

	if (pagina === 1) {
		paginaAnterior.classList.add('ocultar');
		// paginaSiguiente.classList.remove('ocultar');
	} else if (pagina === 3) {
		paginaSiguiente.classList.add('ocultar');
		paginaAnterior.classList.remove('ocultar');

		mostrarResumen(); // cargar los datos cuando estemos en la pagina 3
	} else {
		paginaAnterior.classList.remove('ocultar');
		paginaSiguiente.classList.remove('ocultar');
	}
	mostrarSeccion(); // cambia la seccion que se muestra
}

function mostrarResumen() {
	// Destructuring
	const {nombre, fecha, hora, servicios} = cita;

	// Seleccionar div del resumen
	const resumenDiv = document.querySelector('.contenido-resumen');

	// limpiar el html para que no muestre el "faltan datos"

	while (resumenDiv.innerHTML) {
		resumenDiv.removeChild(resumenDiv.firstChild);
	}

	// validación de objeto
	if (Object.values(cita).includes('')) {
		const noServicios = document.createElement('P');
		noServicios.textContent = 'Faltan datos de servicios, hora, fecha o nombre';
		noServicios.classList.add('invalidar-cita');

		// agregar a resumen a DIV
		resumenDiv.appendChild(noServicios);
		return;
	}

	// mostrar el resumen

	const headingCita = document.createElement('H3');
	headingCita.textContent = 'Resumen Cita';

	const nombreCita = document.createElement('P');
	nombreCita.innerHTML = `<span>Nombre:</span> ${nombre}`;

	const fechaCita = document.createElement('P');
	fechaCita.innerHTML = `<span>Fecha:</span> ${fecha}`;

	const horaCita = document.createElement('P');
	horaCita.innerHTML = `<span>Hora:</span> ${hora}`;

	// Iterar sobre el array de servicios

	const serviciosCita = document.createElement('DIV');
	serviciosCita.classList.add('resumen-servicios');

	const headingServicios = document.createElement('H3');
	headingServicios.textContent = 'Resumen Servicios';

	serviciosCita.appendChild(headingServicios);

	let cantidad = 0;

	servicios.forEach((servicio) => {
		const {nombre, precio} = servicio;
		const contenedorServicio = document.createElement('DIV');
		contenedorServicio.classList.add('contenedor-servicio');

		const textoServicio = document.createElement('P');
		textoServicio.textContent = nombre;

		const precioServicio = document.createElement('P');
		precioServicio.textContent = precio;
		precioServicio.classList.add('precio');

		// Sumar precios de los servicios
		const totalServicio = precio.split('€');
		// console.log(parseInt(totalServicio[0].trim()));
		cantidad += parseInt(totalServicio[0].trim());

		// colocar texto y precio en el div

		contenedorServicio.appendChild(textoServicio);
		contenedorServicio.appendChild(precioServicio);

		serviciosCita.appendChild(contenedorServicio);
	});
	// console.log(cantidad);
	resumenDiv.appendChild(headingCita);
	resumenDiv.appendChild(nombreCita);
	resumenDiv.appendChild(fechaCita);
	resumenDiv.appendChild(horaCita);
	resumenDiv.appendChild(serviciosCita);

	const cantidadPagar = document.createElement('P');
	cantidadPagar.classList.add('total');
	cantidadPagar.innerHTML = `<span>Total a Pagar: </span>${cantidad} €`;
	resumenDiv.appendChild(cantidadPagar);
}

function nombreCita() {
	const nombreInput = document.querySelector('#nombre');
	nombreInput.addEventListener('input', (e) => {
		// console.log('escribiendo en los inputs en tiempo real...');
		// trim elimina los posibles espacios en blanco
		const nombreTexto = e.target.value;
		// console.log(nombreTexto);

		// validación de que el nombre texto no puede estar vacío

		if (nombreTexto === '' || nombreTexto.length < 3) {
			// console.log('nombre no valido', 'error');
			mostrarAlerta('Nombre no válido', 'error');
		} else {
			const alerta = document.querySelector('.alerta');
			if (alerta) {
				alerta.remove();
			}

			cita.nombre = nombreTexto;
			// console.log(cita);
		}
	});
}

function mostrarAlerta(mensaje, tipo) {
	// si hay una alerta no crear otra

	const alertaPrevia = document.querySelector('.alerta');
	if (alertaPrevia) {
		return;
	}

	const alerta = document.createElement('DIV');
	alerta.textContent = mensaje;
	alerta.classList.add('alerta');
	if (tipo === 'error') {
		alerta.classList.add('error');
	}
	// console.log(alerta);

	// Insertar en el HTML
	const formulario = document.querySelector('.formulario');
	formulario.appendChild(alerta);

	// eliminar alerta después de 3 segundos
	setTimeout(() => {
		alerta.remove();
	}, 3000);
}

function fechaCita() {
	const fechaInput = document.querySelector('#fecha');
	fechaInput.addEventListener('input', (e) => {
		// console.log();

		/*

		// cambiar de idioma los datos de objeto Date 

		const opciones = {
			weekday = 'long',
			year = 'numeric',
			month = 'long'
		}
		const dia = new Date(e.target.value).toLocaleDateString('es-ES', opciones);
		
		*/
		// convertir fecha en string, getUTCDay() nos da el dia de la semana de 0 a 6

		const dia = new Date(e.target.value).getUTCDay();

		// validar dia de la semana, domingos y sábados no pasa
		if ([0, 6].includes(dia)) {
			// reset al valor del input
			e.preventDefault();
			fechaInput.value = '';
			// console.log('Este dia no es valido');
			mostrarAlerta('Fines de semana no válidos', 'error');
		} else {
			// console.log('dia valido');
			cita.fecha = fechaInput.value;
		}
		// console.log(cita);
		// console.log(dia);
	});
}

function deshabilitarfechaAnterior() {
	const inputFecha = document.querySelector('#fecha');

	// saber el dia de hoy
	const fechaHoy = new Date();
	const year = fechaHoy.getFullYear();
	// para evitar reservas el mismo dia le sumamos uno
	const dia = fechaHoy.getDate() + 1;
	// los meses en JS empiezan en 0
	const mes = fechaHoy.getMonth() + 1;

	// asegurarnos el formato deseado para validar la fecha AAAA-MM-DD
	// ${mes < 10 ? `0${mes}` : mes} para asegurarnos que la fecha tiene dos dígitos

	const fechaDeshabilitar = `${year}-${mes < 10 ? `0${mes}` : mes}-${dia}`;
	inputFecha.min = fechaDeshabilitar;
}

function horaCita() {
	const inputHora = document.querySelector('#hora');
	inputHora.addEventListener('input', (e) => {
		const horaCitas = e.target.value;
		// nos devuelve un array divido desde :
		const hora = horaCitas.split(':');
		if (hora[0] < 10 || hora[0] > 18) {
			// console.log('horas no validas');
			mostrarAlerta('Hora no válida', 'error');
			setTimeout(() => {
				inputHora.value = '';
			}, 2000);
		} else {
			cita.hora = horaCitas;
		}
	});
}
