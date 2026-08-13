'use client';

import React, { useState } from 'react';

interface CalendarProps {
  bookedDates: Set<string>;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  checkInDate: string;
  checkOutDate: string;
}

export default function Calendar({
  bookedDates,
  onCheckInChange,
  onCheckOutChange,
  checkInDate,
  checkOutDate,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const isDateInPast = (day: number): boolean => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today;
  };

  const isDateBooked = (day: number): boolean => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookedDates.has(dateStr);
  };

  const isDateInRange = (day: number): boolean => {
    if (!checkInDate || !checkOutDate) return false;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const current = new Date(dateStr);
    return current >= start && current < end;
  };

  const getDateString = (day: number): string => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleDateClick = (day: number) => {
    const dateStr = getDateString(day);

    if (isDateBooked(day) || isDateInPast(day)) return;

    if (!checkInDate) {
      // Vybírám check-in
      onCheckInChange(dateStr);
    } else if (!checkOutDate) {
      // Mám check-in, vybírám check-out
      if (dateStr > checkInDate) {
        onCheckOutChange(dateStr);
      } else {
        // Pokud je nové datum dříve, resetuji a vybírám nový check-in
        onCheckOutChange('');
        onCheckInChange(dateStr);
      }
    } else {
      // Mám oba data - reset a začínam znova
      onCheckOutChange('');
      onCheckInChange(dateStr);
    }
  };

  const monthNames = [
    'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
  ];

  const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const isMonthInPast = (): boolean => {
    const today = new Date();
    return (
      currentDate.getFullYear() < today.getFullYear() ||
      (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() < today.getMonth())
    );
  };

  const previousMonth = () => {
    if (!isMonthInPast()) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={previousMonth}
          disabled={isMonthInPast()}
          className={`px-3 py-1 rounded ${
            isMonthInPast()
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ←
        </button>
        <h3 className="font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
        >
          →
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="p-2"></div>;
          }

          const isBooked = isDateBooked(day);
          const isPast = isDateInPast(day);
          const isCheckin = getDateString(day) === checkInDate;
          const isCheckout = getDateString(day) === checkOutDate;
          const inRange = isDateInRange(day);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={isBooked || isPast}
              className={`p-2 text-sm rounded text-center font-medium transition ${
                isBooked || isPast
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isCheckin || isCheckout
                  ? 'bg-blue-600 text-white border-2 border-blue-800'
                  : inRange
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-white text-gray-900 border border-gray-200 hover:bg-blue-50'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded border border-gray-300"></div>
          <span className="text-gray-600">Obsazeno</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded border border-blue-800"></div>
          <span className="text-gray-600">Příjezd / Odjezd</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 rounded border border-blue-200"></div>
          <span className="text-gray-600">Vybrané období</span>
        </div>
      </div>
    </div>
  );
}
