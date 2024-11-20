import React from "react";
import { Provider } from "react-redux";
import store from "./redux/store";
import Week from "./components/Week";
import AssignmentModal from "./components/AssignmentModal";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <Provider store={store}>
      <div className="flex min-h-screen">
        <Sidebar className="w-1/4 bg-gray-200 p-4" /> {/* Sidebar on the side */}
        <div className="flex-1 bg-gray-100 p-4">
          <h1 className="text-center text-2xl font-bold mb-4">Weekly Timetable</h1>
          <Week />
          <AssignmentModal />
        </div>
      </div>
    </Provider>
  );
}

export default App;
