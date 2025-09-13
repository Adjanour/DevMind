"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { cn } from "~/lib/utils";

interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  isRoot?: boolean;
}

interface Connection {
  from: string;
  to: string;
}

interface MindMapData {
  nodes: Node[];
  connections: Connection[];
}

export function MindMapView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mindMapData, setMindMapData] = useState<MindMapData>({
    nodes: [
      {
        id: "root",
        text: "DevMind",
        x: 400,
        y: 300,
        color: "#3b82f6",
        isRoot: true,
      },
    ],
    connections: [],
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const colors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // yellow
    "#8b5cf6", // purple
    "#06b6d4", // cyan
    "#f97316", // orange
    "#84cc16", // lime
  ];

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: Date.now().toString(),
      text: "New Idea",
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setMindMapData((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));

    // Auto-connect to root if it's the first non-root node
    if (mindMapData.nodes.length === 1) {
      setMindMapData((prev) => ({
        ...prev,
        connections: [
          ...prev.connections,
          { from: "root", to: newNode.id },
        ],
      }));
    }

    setEditingNode(newNode.id);
    setEditText(newNode.text);
  }, [mindMapData.nodes.length, colors]);

  const deleteNode = useCallback((nodeId: string) => {
    if (nodeId === "root") return;

    setMindMapData((prev) => ({
      nodes: prev.nodes.filter((node) => node.id !== nodeId),
      connections: prev.connections.filter(
        (conn) => conn.from !== nodeId && conn.to !== nodeId
      ),
    }));

    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const updateNodeText = useCallback((nodeId: string, text: string) => {
    setMindMapData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) =>
        node.id === nodeId ? { ...node, text } : node
      ),
    }));
  }, []);

  const moveNode = useCallback((nodeId: string, x: number, y: number) => {
    setMindMapData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) =>
        node.id === nodeId ? { ...node, x, y } : node
      ),
    }));
  }, []);

  const connectNodes = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;
    
    const connectionExists = mindMapData.connections.some(
      (conn) =>
        (conn.from === fromId && conn.to === toId) ||
        (conn.from === toId && conn.to === fromId)
    );

    if (!connectionExists) {
      setMindMapData((prev) => ({
        ...prev,
        connections: [...prev.connections, { from: fromId, to: toId }],
      }));
    }
  }, [mindMapData.connections]);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    const node = mindMapData.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setDraggedNode(nodeId);
    setDragOffset({
      x: mouseX - node.x,
      y: mouseY - node.y,
    });
  }, [mindMapData.nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - dragOffset.x;
    const newY = mouseY - dragOffset.y;

    moveNode(draggedNode, newX, newY);
  }, [draggedNode, dragOffset, moveNode]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  const startEditing = useCallback((nodeId: string) => {
    const node = mindMapData.nodes.find((n) => n.id === nodeId);
    if (node) {
      setEditingNode(nodeId);
      setEditText(node.text);
    }
  }, [mindMapData.nodes]);

  const saveEdit = useCallback(() => {
    if (editingNode) {
      updateNodeText(editingNode, editText.trim() || "Untitled");
      setEditingNode(null);
      setEditText("");
    }
  }, [editingNode, editText, updateNodeText]);

  const cancelEdit = useCallback(() => {
    setEditingNode(null);
    setEditText("");
  }, []);

  return (
    <div className="flex-1 bg-gray-50 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mind Map</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={addNode}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Node
            </button>
            {selectedNode && selectedNode !== "root" && (
              <button
                onClick={() => deleteNode(selectedNode)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full pt-20"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Connections */}
        <g>
          {mindMapData.connections.map((connection, index) => {
            const fromNode = mindMapData.nodes.find((n) => n.id === connection.from);
            const toNode = mindMapData.nodes.find((n) => n.id === connection.to);
            
            if (!fromNode || !toNode) return null;

            return (
              <line
                key={index}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="none"
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {mindMapData.nodes.map((node) => (
            <g key={node.id}>
              {/* Node Circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.isRoot ? 40 : 30}
                fill={node.color}
                stroke={selectedNode === node.id ? "#1f2937" : "white"}
                strokeWidth={selectedNode === node.id ? 3 : 2}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onClick={() => setSelectedNode(node.id)}
                onDoubleClick={() => startEditing(node.id)}
              />

              {/* Node Text */}
              {editingNode === node.id ? (
                <foreignObject
                  x={node.x - 50}
                  y={node.y - 10}
                  width="100"
                  height="20"
                >
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    onBlur={saveEdit}
                    className="w-full px-2 py-1 text-xs text-center border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    autoFocus
                  />
                </foreignObject>
              ) : (
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  className="text-white text-sm font-medium pointer-events-none select-none"
                  style={{ fontSize: node.isRoot ? "14px" : "12px" }}
                >
                  {node.text.length > 12 ? `${node.text.slice(0, 12)}...` : node.text}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click a node to select it</li>
          <li>• Double-click to edit node text</li>
          <li>• Drag nodes to move them around</li>
          <li>• Use "Add Node" to create new ideas</li>
          <li>• Delete selected nodes (except root)</li>
        </ul>
      </div>

      {/* Connection Tool */}
      {selectedNode && (
        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-2">Connect Nodes</h3>
          <p className="text-sm text-gray-600 mb-3">
            Selected: {mindMapData.nodes.find(n => n.id === selectedNode)?.text}
          </p>
          <div className="space-y-2">
            {mindMapData.nodes
              .filter(n => n.id !== selectedNode)
              .slice(0, 5)
              .map((node) => (
                <button
                  key={node.id}
                  onClick={() => connectNodes(selectedNode, node.id)}
                  className="w-full px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                >
                  Connect to: {node.text}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}