import React from 'react';

const Assignment = ({ assignment, spanCount, day, onClick }) => {
  return (
    <td
      colSpan={spanCount}
      className="border p-4 cursor-pointer bg-blue-100 rounded-lg shadow-sm hover:bg-blue-200 transition-all"
      onClick={() => onClick(assignment)}
    >
      {assignment ? (
        <>
          <div className="text-sm font-semibold">{assignment.title}</div>
          <div className="text-xs text-gray-600">{assignment.description}</div>
        </>
      ) : (
        <span className="text-xs text-gray-400">No assignment</span>
      )}
    </td>
  );
};

export default Assignment;
