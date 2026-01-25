import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Liquidity Pool', value: 95 },
  { name: 'Dev', value: 5 },
];

const COLORS = ['#008080', '#000080'];

export const ChartContent: React.FC = () => {
  return (
    <div className="bg-white h-full flex flex-col p-4">
      <h3 className="text-center font-bold text-xl mb-4 font-['Courier_New']">TOKENOMICS.XLS</h3>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#ffffe0', 
                    border: '1px solid black', 
                    fontFamily: 'Courier New' 
                }} 
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 border-t border-black pt-4">
         <div className="flex justify-between font-mono text-sm border-b border-gray-300 py-1">
            <span>TOTAL SUPPLY:</span>
            <span>1,000,000,000</span>
         </div>
         <div className="flex justify-between font-mono text-sm border-b border-gray-300 py-1">
            <span>TAX:</span>
            <span>0%</span>
         </div>
         <div className="flex justify-between font-mono text-sm border-b border-gray-300 py-1">
            <span>MINT:</span>
            <span>REVOKED</span>
         </div>
      </div>
    </div>
  );
};
