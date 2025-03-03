import React from "react";
import { Provider } from "react-redux";
import store from "./redux/store";
import Week from "./components/Week";
import AssignmentModal from "./components/AssignmentModal";
import Sidebar from "./components/Sidebar";
import SchedulerHeader from "./components/SchedulerHeader";

function App() {
  return (
    <Provider store={store}>
      <div className="flex flex-col pr-10 ">
        <SchedulerHeader />
        <div className="flex relative mt-5">
          <Week />
          <AssignmentModal />
        </div>
        <Sidebar />
      </div>
    </Provider>
  );
}

export default App;
