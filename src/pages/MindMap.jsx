import { useState, useEffect, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as mindMapService from '../services/mindMapService'
import { useSubjects } from '../hooks/useSubjects'
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

export default function MindMap() {
  const { id: subjectId } = useParams()
  const { user } = useAuth()
  const { subjects } = useSubjects()
  const subject = subjects.find(s => s.id === subjectId)

  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [loading, setLoading] = useState(true)
  const [promptTopic, setPromptTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Load existing mind map
  useEffect(() => {
    if (!user || !subjectId) return
    async function loadData() {
      setLoading(true)
      const data = await mindMapService.getMindMap(user.id, subjectId)
      if (data) {
        setNodes(data.nodes || [])
        setEdges(data.edges || [])
      }
      setLoading(false)
    }
    loadData()
  }, [user, subjectId])

  // Save changes
  const saveChanges = useCallback(async (newNodes, newEdges) => {
    if (!user || !subjectId) return
    await mindMapService.saveMindMap(user.id, subjectId, { nodes: newNodes, edges: newEdges })
  }, [user, subjectId])

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const nextNodes = applyNodeChanges(changes, nds);
        saveChanges(nextNodes, edges);
        return nextNodes;
      })
    },
    [saveChanges, edges]
  )

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        const nextEdges = applyEdgeChanges(changes, eds);
        saveChanges(nodes, nextEdges);
        return nextEdges;
      })
    },
    [saveChanges, nodes]
  )

  const handleGenerate = async () => {
    if (!promptTopic.trim()) return
    setIsGenerating(true)
    try {
      const data = await mindMapService.generateMindMapFromAI(promptTopic)
      setNodes(data.nodes || [])
      setEdges(data.edges || [])
      await saveChanges(data.nodes || [], data.edges || [])
    } catch (err) {
      alert(err.message)
    } finally {
      setIsGenerating(false)
      setPromptTopic('')
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <PageHeader
        title="Mind Map Studio"
        actions={
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {subject?.name || 'Knowledge Map'}
            </span>
          </div>
        }
      />

      <div className="p-4 flex gap-2">
        <input
          type="text"
          value={promptTopic}
          onChange={(e) => setPromptTopic(e.target.value)}
          placeholder="Enter a topic (e.g. Photosynthesis)"
          className="flex-1 glass-card px-4 py-2 border-none outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !promptTopic.trim()}
          className="bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
        >
          {isGenerating ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
          )}
          Generate
        </button>
      </div>

      <div className="flex-1 m-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden glass-card relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 z-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            className="bg-slate-50 dark:bg-slate-900"
          >
            <Background color="#94a3b8" gap={16} />
            <Controls className="glass-card shadow-lg" />
          </ReactFlow>
        )}
      </div>
    </div>
  )
}
