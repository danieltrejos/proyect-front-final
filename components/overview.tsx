"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Ene",
    total: 1200000,
  },
  {
    name: "Feb",
    total: 1900000,
  },
  {
    name: "Mar",
    total: 2300000,
  },
  {
    name: "Abr",
    total: 2800000,
  },
  {
    name: "May",
    total: 3500000,
  },
  {
    name: "Jun",
    total: 4200000,
  },
  {
    name: "Jul",
    total: 4800000,
  },
  {
    name: "Ago",
    total: 5200000,
  },
  {
    name: "Sep",
    total: 4700000,
  },
  {
    name: "Oct",
    total: 4300000,
  },
  {
    name: "Nov",
    total: 3900000,
  },
  {
    name: "Dic",
    total: 4320000,
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
