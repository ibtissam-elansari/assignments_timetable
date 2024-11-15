import React from "react";
import { Provider } from "react-redux";
import store from "./redux/store";
import Week from "./components/Week";
import AssignmentModal from "./components/AssignmentModal";

function App() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-center text-2xl font-bold mb-4">Weekly Timetable</h1>
        <Week />
        <AssignmentModal />
      </div>
    </Provider>
  );
}

export default App;
