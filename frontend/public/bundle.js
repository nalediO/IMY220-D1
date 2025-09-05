const App = () => (
  <div className="flex justify-center items-center h-screen bg-gray-100">
    <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
      Click me
    </button>
  </div>
);

ReactDOM.render(<App />, document.getElementById("root"));
