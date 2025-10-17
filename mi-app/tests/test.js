// Pruebas simples para la app de tareas.
// Estas pruebas son básicas y funcionan en entorno de navegador.
// Para ejecutar en Node se puede instalar jsdom y ejecutar con mocha/jest.

function assert(cond, msg){ if(!cond) throw new Error(msg||'Assertion failed') }

function runBasicTests(){
	const app = window.__TASKS_APP__
	if(!app) { console.warn('No se encontró __TASKS_APP__. Abra la app en un navegador para pruebas manuales.'); return }
	// limpiar
	localStorage.clear(); app.load();

	app.addTask('Tarea 1','medium')
	app.addTask('Tarea 2','high')
	app.addTask('Tarea 3','low')
	let tasks = JSON.parse(localStorage.getItem('miapp_tasks_v1'))
	assert(tasks.length===3, 'Debería haber 3 tareas')

	const id = tasks[1].id
	app.toggleComplete(id)
	tasks = JSON.parse(localStorage.getItem('miapp_tasks_v1'))
	assert(tasks.find(t=>t.id===id).status==='done', 'La tarea debería marcarse como hecha')

	app.updateTask(id,{title:'Tarea 2 editada',priority:'low'})
	tasks = JSON.parse(localStorage.getItem('miapp_tasks_v1'))
	const edited = tasks.find(t=>t.id===id)
	assert(edited.title==='Tarea 2 editada' && edited.priority==='low','Edición fallida')

	app.deleteTask(id)
	tasks = JSON.parse(localStorage.getItem('miapp_tasks_v1'))
	assert(tasks.length===2,'El borrado debe reducir el número de tareas')

	console.info('Todas las pruebas básicas pasaron ✅')
}

// Ejecutar automáticamente si estamos en un navegador con window
if(typeof window!=='undefined') window.runBasicTests = runBasicTests
