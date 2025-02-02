import React from "react";
import "./assets/SingleDay.css";

interface SingleDayProps {
  dayName: string;
  monthDay: number;
}

const SingleDay = ({ dayName, monthDay }: SingleDayProps) => {
  return (
    <>
      <div className="day">
        <span className="day-name">{dayName}</span>
        <span className="month-day">{monthDay}</span>
      </div>
    </>
  );
};

export default SingleDay;
