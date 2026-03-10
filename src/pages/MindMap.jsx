import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as mindMapService from '../services/mindMapService'
import { useSubjects } from '../hooks/useSubjects'


export default function MindMap() {
  const { id: subjectId } = useParams()
  const { user } = useAuth()
  const { subjects } = useSubjects()
  const subject = subjects.find(s => s.id === subjectId)

  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!user || !subjectId) return
    async function fetchNodes() {
      try {
        const data = await mindMapService.getMindMap(user.id, subjectId)
        setNodes(data || [])
      } catch (err) {
        console.error('Failed to load mind map:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchNodes()
  }, [user, subjectId])

  const getPos = (n) => ({ x: `${n.x}%`, y: `${n.y}%` })

  const center = nodes.find(n => n.id === 'center')

  return (
    <div>
      <PageHeader
        title="Mind Map"
        actions={
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-xl">add</span>
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-xl">share</span>
            </button>
          </div>
        }
      />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Subject badge */}
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{subject?.name || 'Subject'}</span>
          <span className="text-slate-500 text-sm">{nodes.find(n => n.size === 'lg')?.label.replace('\n', ' ') || 'Concept Map'}</span>
        </div>

        {/* Mind Map Canvas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden relative" style={{ height: 440 }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 z-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : nodes.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-slate-400">
              <span className="material-symbols-outlined text-6xl mb-4">hub</span>
              <p>No nodes found for this subject.</p>
            </div>
          ) : null}
          <div className="relative w-full h-full">
            {/* SVG lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {nodes.filter(n => n.parent).map(n => {
                const parent = nodes.find(p => p.id === n.parent)
                return (
                  <line
                    key={n.id}
                    x1={`${parent.x}%`} y1={`${parent.y}%`}
                    x2={`${n.x}%`} y2={`${n.y}%`}
                    stroke="#e2e8f0" strokeWidth="0.5"
                    className="dark:stroke-slate-700"
                  />
                )
              })}
            </svg>

            {/* Nodes */}
            {nodes.map(n => (
              <button
                key={n.id}
                onClick={() => setSelected(selected === n.id ? null : n.id)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-xl font-semibold leading-tight text-center transition-all hover:scale-105 z-10 ${n.color} ${n.size === 'lg' ? 'px-5 py-3 text-sm shadow-lg' :
                    n.size === 'md' ? 'px-3 py-2 text-xs shadow-md' :
                      'px-2 py-1.5 text-[10px] shadow-sm'
                  } ${selected === n.id ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''} border border-white/50`}
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
              >
                {n.label.split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </button>
            ))}
          </div>
        </div>

        {/* Node detail */}
        {selected && (() => {
          const n = nodes.find(node => node.id === selected)
          return (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-primary/20 shadow-card animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${n.color} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-xl">hub</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{n.label.replace('\n', ' ')}</p>
                  <p className="text-xs text-slate-500">Tap node to deselect</p>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Legend */}
        <div className="flex gap-3 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-primary inline-block" />
            Central topic
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-blue-100 inline-block" />
            Main branches
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-blue-50 border border-blue-100 inline-block" />
            Sub-topics
          </span>
        </div>
      </div>
    </div>
  )
}
