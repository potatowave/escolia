import React, {Component} from 'react';

function onblurCell(e, cell, cellToggled, cellUpdateDatabase){
  cellToggled(false)
  cellUpdateDatabase(e.target.value, cell)
}

function updateCell(e, cellSave, cell, cellToggled, cellUpdateDatabase) {
  if (e.key == 'Enter') {
    cellSave(e.target.value, cell);
    cellToggled(false);
    onblurCell(e, cell, cellToggled, cellUpdateDatabase)
  }
}

export default function Cell({uistate_highlight, uistate_alt_id, low_is_better, cell, cell_index, thisRowsSelectedValue, cellBeingEdited, cellToggled, cellSave, cellUpdateDatabase, enablePlaceholder, ui}) {

  console.log("Rendering <Cell />");
  console.log("Cell - enablePlaceholder:", enablePlaceholder);

  var highlightedClass = (uistate_highlight && (cell.alternative_id === uistate_alt_id)) ? "highlight" : "";

  var compare_tag = "";

  if (uistate_highlight) {
    if (low_is_better) {
      if (cell.value < thisRowsSelectedValue.value) {
        compare_tag = "better"
      } else if (cell.value > thisRowsSelectedValue.value) {
        compare_tag = "worse"
      }
    } else {
      if (cell.value > thisRowsSelectedValue.value) {
        compare_tag = "better"
      } else if (cell.value < thisRowsSelectedValue.value) {
        compare_tag = "worse"
      }
    }
  }

  var isInputVisible = ((cellBeingEdited.alternative_id == cell.alternative_id) && (cellBeingEdited.objective_id == cell.objective_id)) ? true : false;


  // NOTE this will return Cells only if enablePlaceholder is TRUE (render the full 'real' table), or if enablePlaceholder is FALSE (for the instance of the 'fake' table) where the cell obj_id = the selected obj_id
  if((enablePlaceholder || (!enablePlaceholder && cell.objective_id === ui.draggedObjectiveId))) {

    return (
    
      <div
        onDoubleClick={() => cellToggled(cell)}
        // className={"cell c"+(cell_index+1) +" "+highlightedClass+" "+compare_tag}
        className={"cell c"+(cell_index+1) +" "+(enablePlaceholder && (
              cell.alternative_id === ui.draggedAlternativeId ||
              cell.objective_id.id === ui.draggedObjectiveId
            ) ? ' placeholder' : '')+" "+compare_tag}
        >
        { !isInputVisible && cell.value }

        { isInputVisible &&
          <input
          autoFocus
          type="text"
          value={cell.value}
          onBlur={(e) => onblurCell(e, cell, cellToggled, cellUpdateDatabase)}
          onChange={(e) => { cellSave(e.target.value, cell) }}
          onKeyPress= {(e) => updateCell(e, cellSave, cell, cellToggled, cellUpdateDatabase) }
          />
        }
      </div> 
    )

  } else {
    return (<div></div>)
  }
}

