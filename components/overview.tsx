"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    total: 1200,
  },
  {
    name: "Feb",
    total: 1900,
  },
  {
    name: "Mar",
    total: 2300,
  },
  {
    name: "Apr",
    total: 2800,
  },
  {
    name: "May",
    total: 3500,
  },
  {
    name: "Jun",
    total: 4200,
  },
  {
    name: "Jul",
    total: 4800,
  },
  {
    name: "Aug",
    total: 5200,
  },
  {
    name: "Sep",
    total: 4700,
  },
  {
    name: "Oct",
    total: 4300,
  },
  {
    name: "Nov",
    total: 3900,
  },
  {
    name: "Dec",
    total: 4320,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
