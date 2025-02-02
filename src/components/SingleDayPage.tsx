import React, { useEffect, useRef, useState } from "react";
import SingleDay from "./SingleDay";
import Timings from "./Timings";
import { getDayName, getMonthDayNumber, hours } from "./utils/Utils";
import "./assets/Timings.css";
import "./assets/SingleDayPage.css";
import "./assets/AddTaskForm.css";

interface Task {
  id: string;
  name: string;
  date: string;
  startHour: string;
  endHour: string;
}

interface SingleDayPageProps {
  currentDateState: Date;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const SingleDayPage = ({
  currentDateState,
  tasks,
  setTasks,
}: SingleDayPageProps) => {
  const dayName = getDayName(currentDateState);
  const monthDay = getMonthDayNumber(currentDateState);

  const containerRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const tasksForCurrentDay = tasks.filter(
    (task) => task.date === currentDateState.toISOString().substring(0, 10)
  );

  
const calculateTopPosition = (taskStartTime: string) => {
  const [hours, minutes] = taskStartTime.split(":").map(Number);

  const totalMinutes = hours * 60 + minutes;
  const timingCellHeight = 50;
  const minutesPerCell = 60;
  const timingCellIndex = Math.floor(totalMinutes / minutesPerCell);
  return `${timingCellIndex * timingCellHeight + 10}px`;
};

  useEffect(() => {
    if (!boxRefs.current || !containerRef.current) return;

    // const box = boxRefs.current;
    const container = containerRef.current;

    const dragStart = (e: any) => {
      setIsDragging(true);

      const targetElement = e.target as HTMLDivElement | null;

      if (targetElement && targetElement.className.includes("box")) {
        targetElement.classList.add("dragging");
        e.dataTransfer.setData("text/plain", targetElement.id);
      }

      setTimeout(() => {
        if (targetElement) targetElement.classList.add("hide");
      }, 0);
    };

    const drag = (e: any) => {};

    const dragEnd = (e: any) => {
      setIsDragging(false);
      const targetElement = e.target as HTMLDivElement | null;

      if (targetElement && targetElement.className.includes("box")) {
        targetElement.classList.remove("dragging");
      }
    };

    const dragOver = (e: any) => {
      setIsDragging(true);
      if (e.dataTransfer.types[0] === "text/plain") {
        e.preventDefault();
      }
    };

    const drop = (e: any) => {
      e.preventDefault();
      setIsDragging(false);

      const id = e.dataTransfer.getData("text/plain");
      const draggable = document.getElementById(id);

      if (!id || !draggable || !container) return;

      const rect = e.target.getBoundingClientRect();

      const updatedY = e.clientY - rect.top;

      const timingCellHeight = 50;
      const minutesPerCell = 60;
      const timingCellIndex = Math.floor(updatedY / timingCellHeight);

      const movedMinutes = timingCellIndex * minutesPerCell;
      const movedHours = Math.floor(movedMinutes / 60);
      const movedMinutesRemainder = movedMinutes % 60;

      const startDateCoords = new Date(currentDateState);
      startDateCoords.setHours(movedHours, movedMinutesRemainder, 0, 0);

      const endDateCoords = new Date(startDateCoords);
      endDateCoords.setMinutes(startDateCoords.getMinutes() + minutesPerCell);

      const options = {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      } as Intl.DateTimeFormatOptions;

      const startHour = startDateCoords.toLocaleTimeString([], options);
      const endHour = endDateCoords.toLocaleTimeString([], options);

      const updatedTasks = tasks.map((task) => {
        if (task.id.toString() === id) {
          return {
            ...task,
            startDateCoords,
            startHour,
            endHour,
          };
        }
        return task;
      });

      setTasks(updatedTasks);

      if (draggable.className.includes("box")) {
        draggable.style.top = `${
            timingCellIndex * timingCellHeight + 10
          }px)`
        draggable.classList.remove("hide");
        e.target.appendChild(draggable);
      }
    };

    boxRefs.current.forEach((boxRef) => {
      if (boxRef) {
        boxRef.addEventListener("dragstart", dragStart);
        boxRef.addEventListener("dragend", dragEnd);
      }
    });

    container.addEventListener("dragover", dragOver);
    container.addEventListener("drop", drop);

    return () => {
      boxRefs.current.forEach((boxRef) => {
        if (boxRef) {
          boxRef.removeEventListener("dragstart", dragStart);
          boxRef.removeEventListener("dragend", dragEnd);
        }
      });

      container.removeEventListener("dragover", dragOver);
      container.removeEventListener("drop", drop);
    };
  }, [tasks, currentDateState]);

  return (
    <>
      <div className="content-grid">
        <div className="day-container">
          <div className="single-day">
            <SingleDay 
            dayName={dayName} 
            monthDay={monthDay} 
              />
          </div>
          <div className="timing-container">
            <Timings hours={hours} />
          </div>

          <div className="subgrid-single-day-container grid-view" ref={containerRef}>
            {tasksForCurrentDay &&
              tasksForCurrentDay.map((task, index) => (          
                <div
                  key={task.id || ""}
                  className="box"
                  draggable={true}
                  ref={(ref) => (boxRefs.current[index] = ref)}
                  id={task.id}
                  style={{ top: calculateTopPosition(task.startHour) }} 

                >
                  <div>Task Name: {task.name}</div>
                  <div>Start date: {task.date}</div>
                  <div>
                    {task.startHour}&nbsp;-&nbsp;{task.endHour}
                  </div>
                
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleDayPage;
