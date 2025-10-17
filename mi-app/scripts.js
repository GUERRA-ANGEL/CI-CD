// Gestor de tareas simple con localStorage
const STORAGE_KEY = 'miapp_tasks_v1'

let tasks = []
let currentFilter = 'all'
let sortByPriority = false

const form = document.getElementById('task-form')
const titleInput = document.getElementById('task-title')
const priorityInput = document.getElementById('task-priority')
const listEl = document.getElementById('task-list')
const filterBtns = document.querySelectorAll('.filter-btn')
const sortToggle = document.getElementById('sort-toggle')

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}

function save(){
	localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function load(){
	try{tasks = JSON.parse(localStorage.getItem(STORAGE_KEY))||[] }catch(e){tasks=[]}
}

function addTask(title, priority){
	const t = {id:uid(),title,priority,status:'pending',created:Date.now()}
	tasks.push(t)
	save(); render()
}

function updateTask(id, fields){
	const idx = tasks.findIndex(t=>t.id===id)
	if(idx<0) return false
	tasks[idx] = {...tasks[idx],...fields}
	save(); render(); return true
}

function deleteTask(id){
	tasks = tasks.filter(t=>t.id!==id)
	save(); render()
}

function toggleComplete(id){
	const t = tasks.find(x=>x.id===id); if(!t) return
	t.status = t.status==='pending'?'done':'pending'
	save(); render()
}

function applyFilter(list){
	if(currentFilter==='pending') return list.filter(t=>t.status==='pending')
	if(currentFilter==='done') return list.filter(t=>t.status==='done')
	return list
}

function applySort(list){
	if(!sortByPriority) return list
	const order = {high:1,medium:2,low:3}
	return [...list].sort((a,b)=>order[a.priority]-order[b.priority])
}

function render(){
	listEl.innerHTML = ''
	let out = applyFilter(tasks)
	out = applySort(out)
	if(out.length===0){
		listEl.innerHTML = '<li class="task-item"><div class="task-meta">No hay tareas</div></li>'
		return
	}

	out.forEach(t=>{
		const li = document.createElement('li')
		li.className = 'task-item'
		li.dataset.id = t.id

		const left = document.createElement('div'); left.className='task-left'
		const cb = document.createElement('input'); cb.type='checkbox'; cb.checked = t.status==='done'
		cb.addEventListener('change',()=>toggleComplete(t.id))
		const title = document.createElement('div'); title.className='task-title'+(t.status==='done'?' done':''); title.textContent = t.title
		const meta = document.createElement('div'); meta.className='task-meta'; meta.textContent = new Date(t.created).toLocaleString()
		left.appendChild(cb)
		const textWrap = document.createElement('div')
		textWrap.appendChild(title); textWrap.appendChild(meta)
		left.appendChild(textWrap)

		const right = document.createElement('div'); right.className='task-actions'
		const badge = document.createElement('span'); badge.className='priority-badge priority-'+t.priority; badge.textContent = t.priority
		const editBtn = document.createElement('button'); editBtn.className='btn edit'; editBtn.textContent='Editar'
		editBtn.addEventListener('click',()=>startEdit(t.id))
		const delBtn = document.createElement('button'); delBtn.className='btn delete'; delBtn.textContent='Eliminar'
		delBtn.addEventListener('click',()=>{ if(confirm('Eliminar tarea?')) deleteTask(t.id) })

		right.appendChild(badge); right.appendChild(editBtn); right.appendChild(delBtn)

		li.appendChild(left); li.appendChild(right)
		listEl.appendChild(li)
	})
}

function startEdit(id){
	const t = tasks.find(x=>x.id===id); if(!t) return
	const newTitle = prompt('Editar tarea', t.title)
	if(newTitle===null) return
	const newPriority = prompt('Prioridad (low, medium, high)', t.priority)
	if(newPriority===null) return
	if(!['low','medium','high'].includes(newPriority)) return alert('Prioridad inválida')
	updateTask(id,{title:newTitle,priority:newPriority})
}

form.addEventListener('submit', e=>{
	e.preventDefault()
	const title = titleInput.value.trim()
	const pr = priorityInput.value
	if(!title) return
	addTask(title,pr)
	titleInput.value=''
})

filterBtns.forEach(b=>b.addEventListener('click', e=>{
	filterBtns.forEach(x=>x.classList.remove('active'))
	e.currentTarget.classList.add('active')
	currentFilter = e.currentTarget.dataset.filter
	render()
}))

sortToggle.addEventListener('click', ()=>{ sortByPriority = !sortByPriority; sortToggle.textContent = sortByPriority? 'Por prioridad' : 'Alternar' ; render() })

// init
load(); render()

// Exports para pruebas simples (si se usa node + jsdom en tests)
if(typeof window!=='undefined') window.__TASKS_APP__ = {addTask,updateTask,deleteTask,toggleComplete,load,save,render}

