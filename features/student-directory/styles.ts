
/**
 * Unified style definitions for the Student Directory feature.
 * Using Tailwind utility strings separated into objects for better organization.
 */

export const CommonStyles = {
  card: "bg-white rounded-2xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] border border-slate-100",
  input: "bg-slate-50 border border-slate-200 rounded-lg px-8 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 min-w-[140px] cursor-pointer appearance-none text-center relative",
  label: "text-slate-700 text-sm font-bold w-28 text-right",
};

export const BirthdayStyles = {
  container: "bg-white rounded-2xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] border border-slate-100 p-5 w-full flex flex-col gap-3 min-h-[140px]",
  header: "flex items-center text-blue-600 font-bold mb-1 border-b border-slate-50 pb-2",
  itemToday: "bg-green-50 text-green-700 border border-green-100 flex justify-between items-center text-sm p-3 rounded-lg transition-colors cursor-pointer gap-4 text-right",
  itemNormal: "text-slate-700 border border-slate-50 flex justify-between items-center text-sm p-3 rounded-lg transition-colors hover:bg-slate-50 cursor-pointer gap-4 text-right",
  dateText: "font-bold whitespace-nowrap bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs",
  nameText: "font-medium text-right flex-grow leading-tight",
};

export const FilterStyles = {
  container: "grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 bg-white rounded-2xl p-8 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] border border-slate-50",
  row: "flex items-center justify-end gap-3",
  selectIcon: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none",
  sliderContainer: "flex flex-col items-end gap-2 pt-2",
  sliderTrack: "absolute h-1.5 w-full bg-slate-100 rounded-full",
  sliderRange: "absolute h-1.5 bg-blue-500 rounded-full",
  thumb: "absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none",
};

export const TableStyles = {
  container: "w-full bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden",
  headerRow: "bg-blue-100/60 border-b border-slate-100",
  headerCell: "px-4 py-5 text-blue-700 font-bold text-sm",
  row: "hover:bg-blue-50/40 transition-colors group divide-y divide-slate-50",
  cell: "px-4 py-4 text-slate-600 text-sm",
  cellName: "px-4 py-4 text-slate-800 font-bold text-sm group-hover:text-blue-700",
  cellId: "px-4 py-4 font-bold text-blue-500 text-sm cursor-pointer hover:underline",
};

// Added ProfileStyles to support StudentProfile component within this directory
export const ProfileStyles = {
  container: "max-w-4xl mx-auto bg-white rounded-3xl p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100",
  header: "flex justify-between items-center border-b-2 border-slate-50 pb-8 mb-10",
  title: "text-3xl font-black text-slate-900 tracking-tight",
  section: "grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6",
  fieldContainer: "flex items-center justify-end gap-6 border-b border-slate-50 pb-4",
  fieldLabel: "text-slate-500 text-sm font-bold min-w-[130px] text-right",
  fieldValue: "text-slate-800 font-bold text-lg text-right flex-grow",
  backButton: "bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-3 px-8 rounded-2xl transition-all flex items-center gap-3 active:scale-95 shadow-sm"
};
