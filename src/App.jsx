import { useState } from 'react';
import useWindowWidth from './useWindowWidth';

// import/export via input field
// maybe wrap zones in flex and make direction row instead of column

// mock items
const generateMockItems = () => [
  "Set up monitoring alerts for production database performance metrics",
  "Write blog post about microservices architecture best practices",
  "Attend security training certification workshop",
  "Backup files",
  "Test login flow",
  "Deploy v2.5 release to staging environment for QA testing",
  "Organize code review sessions with senior engineers",
  "Update project dependencies and patch security vulnerabilities",
  "Create user guide for new dashboard features",
  "Fix typos in README documentation",
  "Call client",
  "Review PR #847"
];


export default function PrioritySorter() {
  const [items, setItems] = useState(generateMockItems());
  const [currentPage, setCurrentPage] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [insertionIndex, setInsertionIndex] = useState(null); // The gap where item will be inserted
  const [showOutput, setShowOutput] = useState(false);
  const [hoveredZone, setHoveredZone] = useState(null); // Track which drop zone is hovered
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const windowWidth = useWindowWidth();
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleItems = items.slice(startIndex, startIndex + itemsPerPage);
  
  const handleDragStart = (e, index) => {
    setDraggedIndex(startIndex + index);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const globalIndex = startIndex + index;
    
    // Determine if cursor is in top or bottom half
    if (e.clientY < midpoint) {
      setInsertionIndex(globalIndex); // Insert before this item
    } else {
      setInsertionIndex(globalIndex + 1); // Insert after this item
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    
    if (draggedIndex === null || insertionIndex === null) {
      setDraggedIndex(null);
      setInsertionIndex(null);
      return;
    }
    
    // Adjust insertion index if dragging from before the insertion point
    let targetIndex = insertionIndex;
    if (draggedIndex < insertionIndex) {
      targetIndex = insertionIndex - 1;
    }
    
    if (draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setInsertionIndex(null);
      return;
    }
    
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    
    setItems(newItems);
    setDraggedIndex(null);
    setInsertionIndex(null);
  };
  
  const handleDropToPrevPage = (e) => {
    e.preventDefault();
    if (draggedIndex === null || currentPage === 0) return;
    
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    const targetIndex = (currentPage - 1) * itemsPerPage;
    newItems.splice(targetIndex, 0, draggedItem);
    
    setItems(newItems);
    setDraggedIndex(null);
    setInsertionIndex(null);
    // Don't auto-switch pages
  };
  
  const handleDropToNextPage = (e) => {
    e.preventDefault();
    if (draggedIndex === null || currentPage >= totalPages - 1) return;
    
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    const targetIndex = Math.min((currentPage + 1) * itemsPerPage, newItems.length);
    newItems.splice(targetIndex, 0, draggedItem);
    
    setItems(newItems);
    setDraggedIndex(null);
    setInsertionIndex(null);
    // Don't auto-switch pages
  };
  
  const handleDropToBeginning = (e) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === 0) return;
    
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.unshift(draggedItem);
    
    setItems(newItems);
    setDraggedIndex(null);
    setInsertionIndex(null);
  };
  
  const handleDropToEnd = (e) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === items.length - 1) return;
    
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.push(draggedItem);
    
    setItems(newItems);
    setDraggedIndex(null);
    setInsertionIndex(null);
  };
  
  const clearDragState = () => {
    setInsertionIndex(null);
  };
  
  const truncateText = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  };
  
  // Check if insertion line should show before this item
  const showInsertionBefore = (globalIndex) => {
    if (insertionIndex === null || draggedIndex === null) return false;
    if (globalIndex === draggedIndex || globalIndex === draggedIndex + 1) return false;
    return insertionIndex === globalIndex;
  };
  
  // Check if insertion line should show after the last item
  const showInsertionAfterLast = () => {
    if (insertionIndex === null || draggedIndex === null) return false;
    const lastVisibleGlobalIndex = startIndex + visibleItems.length - 1;
    if (lastVisibleGlobalIndex === draggedIndex) return false;
    return insertionIndex === lastVisibleGlobalIndex + 1;
  };
  
  const insertionLineStyle = {
    // it shouldnt impact layout when it appears, so no margin or padding changes, just a thin line that appears between items
    height: '3px',
    position: 'absolute',
    left: '0',
    right: '0',
    backgroundColor: '#6c5ce7',
    margin: '0',
  };
  
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '700px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{
        position: 'relative',
      }}>
        <h1 style={{ 
          margin: '0 0 8px 0', 
          color: 'var(--text-primary, #1a1a2e)',
          fontSize: '1.75rem'
        }}>
          Priority {windowWidth < 288 ? <br /> : ''} Sort
        </h1>
        <p style={{ 
          margin: '0 0 20px 0', 
          color: 'var(--text-secondary, #666)',
          fontSize: '0.9rem'
        }}>
          Import items. Drag to reorder. Export and enjoy your newly prioritized list!
        </p>
        <button
          onClick={() => setItems(generateMockItems())}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#6c5ce7',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '500',
            position: 'absolute',
            top: '0px',
            right: '0px',
            display: 'none',
          }}
        >
          {/* when width less than 380px replace with icon */}
          {windowWidth < 380 ? '⬆' : 'Import / Export'}
        </button>
      </div>
      
      
      {/* Move to Very Beginning Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setHoveredZone('beginning')}
        onDragLeave={() => setHoveredZone(null)}
        onDrop={(e) => { handleDropToBeginning(e); setHoveredZone(null); }}
        style={{
          padding: '10px',
          marginBottom: '6px',
          border: `2px dashed ${draggedIndex !== null && hoveredZone === 'beginning' ? '#00896b' : 'transparent'}`,
          borderRadius: '8px',
          textAlign: 'center',
          color: '#00896b',
          backgroundColor: draggedIndex !== null && hoveredZone === 'beginning' ? '#d0f5eb' : '#f0faf8',
          opacity: draggedIndex !== null && draggedIndex !== 0 ? 1 : 0.75,
          transition: 'all 0.2s ease',
          fontSize: '0.9rem',
          fontWeight: '500'
        }}
      >
        Make first item
      </div>
      
      {/* Previous Page Drop Zone */}
      {currentPage > 0 && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setHoveredZone('prev')}
          onDragLeave={() => setHoveredZone(null)}
          onDrop={(e) => { handleDropToPrevPage(e); setHoveredZone(null); }}
          style={{
            padding: '10px',
            marginBottom: '6px',
            border: `2px dashed ${draggedIndex !== null && hoveredZone === 'prev' && currentPage > 0 ? '#5a4fcf' : 'transparent'}`,
            borderRadius: '8px',
            textAlign: 'center',
            color: currentPage === 0 ? '#aaa' : '#5a4fcf',
            backgroundColor: draggedIndex !== null && hoveredZone === 'prev' && currentPage > 0 ? '#e8e5ff' : '#f5f4ff',
            opacity: draggedIndex !== null && currentPage > 0 ? 1 : 0.75,
            transition: 'all 0.2s ease',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          ↑ Move item to Page {currentPage} (Previous)
        </div>
      )}
      
      {/* Items List */}
      <div 
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-primary, #fff)',
          position: 'relative'
        }}
        onDragLeave={clearDragState}
      >
        {visibleItems.map((item, index) => {
          const globalIndex = startIndex + index;
          const isDragging = draggedIndex === globalIndex;
          
          return (
            <div key={globalIndex}>
              {/* Insertion line before this item */}
              {showInsertionBefore(globalIndex) && (
                <div style={insertionLineStyle} />
              )}
              
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderBottom: index < visibleItems.length - 1 ? '1px solid #eee' : 'none',
                  backgroundColor: isDragging ? '#e8f4fd' : 'transparent',
                  cursor: 'grab',
                  transition: 'background-color 0.15s ease',
                  opacity: isDragging ? 0.5 : 1
                }}
              >
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#6c5ce7',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  marginRight: '14px',
                  flexShrink: 0
                }}>
                  {globalIndex + 1}
                </span>
                <span style={{
                  flex: 1,
                  color: 'var(--text-primary, #333)',
                  fontSize: '0.95rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {truncateText(item)}
                </span>
                <span style={{
                  color: '#aaa',
                  marginLeft: '12px',
                  fontSize: '1.2rem'
                }}>
                  ⋮⋮
                </span>
              </div>
            </div>
          );
        })}
        
        {/* Insertion line after last item */}
        {showInsertionAfterLast() && (
          <div style={insertionLineStyle} />
        )}
      </div>
      
      {/* Next Page Drop Zone */}
      {currentPage < totalPages - 1 && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setHoveredZone('next')}
          onDragLeave={() => setHoveredZone(null)}
          onDrop={(e) => { handleDropToNextPage(e); setHoveredZone(null); }}
          style={{
            padding: '10px',
            marginTop: '6px',
            border: `2px dashed ${draggedIndex !== null && hoveredZone === 'next' && currentPage < totalPages - 1 ? '#5a4fcf' : 'transparent'}`,
            borderRadius: '8px',
            textAlign: 'center',
            color: currentPage >= totalPages - 1 ? '#aaa' : '#5a4fcf',
            backgroundColor: draggedIndex !== null && hoveredZone === 'next' && currentPage < totalPages - 1 ? '#e8e5ff' : '#f5f4ff',
            opacity: draggedIndex !== null && currentPage < totalPages - 1 ? 1 : 0.75,
            transition: 'all 0.2s ease',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          ↓ Move item to Page {currentPage + 2} (Next)
        </div>
      )}
      
      {/* Move to Very End Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setHoveredZone('end')}
        onDragLeave={() => setHoveredZone(null)}
        onDrop={(e) => { handleDropToEnd(e); setHoveredZone(null); }}
        style={{
          padding: '10px',
          marginTop: '6px',
          border: `2px dashed ${draggedIndex !== null && hoveredZone === 'end' ? '#00896b' : 'transparent'}`,
          borderRadius: '8px',
          textAlign: 'center',
          color: '#00896b',
          backgroundColor: draggedIndex !== null && hoveredZone === 'end' ? '#d0f5eb' : '#f0faf8',
          opacity: draggedIndex !== null && draggedIndex !== items.length - 1 ? 1 : 0.75,
          transition: 'all 0.2s ease',
          fontSize: '0.9rem',
          fontWeight: '500'
        }}
      >
        Make last item
      </div>
      
      {/* Pagination Controls */}
      <div style={{
        display: 'flex',
        flexDirection: windowWidth < 510 ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        marginTop: '20px'
      }}>
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: currentPage === 0 ? '#e0e0e0' : '#6c5ce7',
            color: currentPage === 0 ? '#999' : 'white',
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            transition: 'background-color 0.2s ease'
          }}
        >
          ← Previous
        </button>
        
        <div style={{
          display: 'flex',
          gap: '6px'
        }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              style={{
                width: '36px',
                height: '36px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: currentPage === i ? '#6c5ce7' : '#f0f0f0',
                color: currentPage === i ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: currentPage >= totalPages - 1 ? '#e0e0e0' : '#6c5ce7',
            color: currentPage >= totalPages - 1 ? '#999' : 'white',
            cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            transition: 'background-color 0.2s ease'
          }}
        >
          Next →
        </button>
        {/* items per page selector - 10 / 15 / 20 / 30 */}
        <select
          name='itemsPerPage'
          value={itemsPerPage}
          onChange={(e) => {
            setCurrentPage(0);
            setItemsPerPage(Number(e.target.value));
          }}
          style={{
            marginLeft: '20px',
            padding: '10px 10px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            backgroundColor: '#fff',
            color: '#333',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          {[10, 15, 20, 30].map(num => (
            <option key={num} value={num}>{num} per page</option>
          ))}
        </select>
      </div>
      
      {/* Export Button */}
      <button
        onClick={() => setShowOutput(!showOutput)}
        style={{
          display: 'block',
          width: '100%',
          marginTop: '24px',
          padding: '14px',
          border: 'none',
          borderRadius: '10px',
          backgroundColor: '#00b894',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
      >
        {showOutput ? 'Hide items' : '📋 Show ordered items'}
      </button>
      
      {/* Output Display */}
      {showOutput && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
            Final Prioritized Order:
          </h3>
          <ol style={{
            margin: 0,
            padding: '0 0 0 32px',
            color: '#444',
            fontSize: '0.9rem',
            lineHeight: '1.8',
            listStyleType: 'decimal',
            listStylePosition: 'outside'
          }}>
            {items.map((item, i) => (
              <li key={i} style={{ 
                marginBottom: '4px',
                paddingLeft: '8px'
              }}>
                {item}
              </li>
            ))}
          </ol>
        </div>
      )}
      <footer style={{
        marginTop: '40px',
        textAlign: 'center',
        color: '#aaa',
        marginBottom: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #eee',
      }}>
        Check out the source code on <a href="https://github.com/okplanbo/drag-n-drop-priority-sort" target="_blank" rel="noopener noreferrer" style={{ color: '#6c5ce7', textDecoration: 'none' }}>GitHub</a>. Author: <a href="https://okbo.dev" target="_blank" rel="noopener" style={{ color: '#6c5ce7', textDecoration: 'none' }}>okbo.dev</a>.
      </footer>
    </div>
  );
}
