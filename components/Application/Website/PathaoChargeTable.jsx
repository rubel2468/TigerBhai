import React from "react";

const charges = [
  {
    area: "Same City / District",
    data: [
      { weight: "≤ 500 g", time: "24 hrs", charge: "৳60" },
      { weight: "500 g – 1 kg", time: "24 hrs", charge: "৳70" },
      { weight: "1 – 2 kg", time: "24 hrs", charge: "৳90" },
      { weight: "> 2 kg", time: "—", charge: "+৳15/kg" },
    ],
  },
  {
    area: "Dhaka Metro → Nearby Areas",
    data: [
      { weight: "≤ 500 g", time: "72 hrs", charge: "৳80" },
      { weight: "500 g – 1 kg", time: "72 hrs", charge: "৳100" },
      { weight: "1 – 2 kg", time: "72 hrs", charge: "৳130" },
      { weight: "> 2 kg", time: "—", charge: "+৳25/kg" },
    ],
  },
  {
    area: "Dhaka/Suburbs ↔ Outside Dhaka",
    data: [
      { weight: "≤ 500 g", time: "72 hrs", charge: "৳110" },
      { weight: "500 g – 1 kg", time: "72 hrs", charge: "৳130" },
      { weight: "1 – 2 kg", time: "72 hrs", charge: "৳170" },
      { weight: "> 2 kg", time: "—", charge: "+৳25/kg" },
    ],
  },
  {
    area: "Outside Dhaka ↔ Outside Dhaka",
    data: [
      { weight: "≤ 500 g", time: "72 hrs", charge: "৳120" },
      { weight: "500 g – 1 kg", time: "72 hrs", charge: "৳145" },
      { weight: "1 – 2 kg", time: "72 hrs", charge: "৳180" },
      { weight: "> 2 kg", time: "—", charge: "+৳25/kg" },
    ],
  },
];

export default function PathaoChargeTable() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        📦 Pathao Courier Delivery Charges
      </h2>
      {charges.map((zone, idx) => (
        <div key={idx} className="mb-8">
          <h3 className="text-xl font-semibold mb-3">{zone.area}</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border">Weight Range</th>
                  <th className="p-3 border">Delivery Time</th>
                  <th className="p-3 border">Charge</th>
                </tr>
              </thead>
              <tbody>
                {zone.data.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 border">{row.weight}</td>
                    <td className="p-3 border">{row.time}</td>
                    <td className="p-3 border font-semibold text-green-600">
                      {row.charge}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="mt-6 text-sm text-gray-600">
        <p>💰 COD (Cash on Delivery): 1% of product price</p>
        <p>↩️ Return Charge: 50% of delivery cost (outside Dhaka)</p>
      </div>
    </div>
  );
}
