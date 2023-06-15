import React, { useRef, useState } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  const addMoveable = async () => {
    // Create a new moveable component and add it to the array

    const FIT = ['fill', 'contain', 'cover', 'none', 'scale-down']
    // Fetch the image for the component
    const id = Math.floor(Math.random() * 5000)
    const image = await fetch(`https://jsonplaceholder.typicode.com/photos/${id}`).then(res =>{
      return res.json()
    })
    
    // Add the component to the array with fixed data
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        updateEnd: true,
        image: image.url,
        fit: FIT[Math.floor(Math.random() * FIT.length)],
        transform: `translate(0,0)`
      },
    ]);
  };

  const removeMoveable = async () => {
    // Verify if a moveable is selected, if not, alerts the user
    if(!selected) alert('Select a moveable to remove')
    //Remove the moveable from the array
    const newMoveableComponents = moveableComponents.filter(el => el.id !== selected)
    setMoveableComponents(newMoveableComponents)
    setSelected(null)
  }

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    //Update the moveable info with the provided id
    const updatedMoveables = moveableComponents.map((moveable) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  return (
    <main style={{ height : "100vh", width: "100vw", display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10}}>
        <button
          onClick={addMoveable}
          style={{
            backgroundColor: 'green',
            padding: 10,
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 20
          }}
        >
          Add Moveable
        </button>
        <button
          onClick={removeMoveable}
          style={{
            backgroundColor: 'red',
            padding: 10,
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 20
          }}
        >
          Remove Moveable
        </button>
      </div>
      <div
        id="parent"
        style={{
          position: "relative",
          height: "80vh",
          width: "80vw",
          marginTop: 20,
          borderColor: '#777',
          borderWidth: 10,
          borderStyle: 'solid'
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
      <div>
        <p style={{fontFamily: 'sans-serif'}}>Fixed By: Juan de Dios 🤓</p>
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  id,
  setSelected,
  isSelected = false,
  image,
  transform,
  fit
}) => {

  // Create a ref to know if the moveable is selected
  const ref = useRef();
  // Get the parent bounds.
  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  
  const onResize = async (e) => {
    // Update moveable size
    let newWidth = e.width, newHeight = e.height
    // Verify what is the max position for the moveable
    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;
    // If the max position exceeds the parent bounds, it fixes the position
    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      image,
      fit,
    });

  };

  const onDrag = (e) => {
    const {top, left, bottom, right, width, height} = e
    // When draggin the moveable, verify if it's within the parent bounds, if not, fix its position
    // If top/left are less than 0, return 0, else verify its bottom and right position
    // If bottom/right are less than 0, return the parent bounds minus its height or width, else return the actual top/left position
    const newTop = top < 0 ? 0 : (bottom < 0) ? parentBounds.height - height : top

    const newLeft = left < 0 ? 0 : (right < 0) ? parentBounds.width - width : left

    updateMoveable(id, {
      top: newTop,
      left: newLeft,
      width,
      height,
      image,
      fit,
    });
  }

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          backgroundImage: `url(${image})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: fit,
          transform: transform,
          cursor: 'pointer'
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        snappable
        snapDirections={{"top":true,"left":true,"bottom":true,"right":true}}
        snapThreshold={5}
        verticalGuidelines={[50,150,250,450,550, 650]}
        horizontalGuidelines={[0,100,200,400,500, 600, 700, 800, 900]}
        onDrag={onDrag}
        onResize={onResize}
        keepRatio={true}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
