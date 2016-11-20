const express   = require('express');

module.exports = (knex) => {

  const user_id = 1;

  // Mapping id from front-end to database id in order to be able to add values
  // Format should be: [idFrontEnd: idBackEnd]

  const objectivesMap       = {};
  const alternativesMap     = {};
  let countInsertedValues   = 0;

  // To be track of numbers of aSync request and know when is done
  let totalObjectives;
  let totalAlternatives;


  /**
  * Checking if Alternatives AND objectives were ALL added
  * @returns {boolean}
  */
  function isDoneInserting() {
    return (Object.keys(alternativesMap).length == totalAlternatives) && (Object.keys(objectivesMap).length == totalObjectives);
  }

  /**
  * Insert values into database
  * @param {object}   values      - all cell values data from frontend
  * @param {function} callback    - Callback function to run after aSync DB call
  * @returns {void}               - It will call Callback function aSync
  */
  function insertValue(value, callback) {

    // Insert values into database
    knex.insert({
      alternative_id: parseInt(value.alternative_id),
      objective_id:   parseInt(value.objective_id),
      value:          value.value
    })
    .into('alternatives_objectives')
    .then( (objective_id) => {
      console.log('Insert Value');
      countInsertedValues++;
      if(countInsertedValues == totalObjectives * totalAlternatives) {
        callback('Case created successful');
      }
    })
    .catch(function(error) { console.error(error); });
  }

  /**
  * Swap the front-end id by database id
  * @param {object}   values      - all cell values data from frontend
  * @param {function} callback    - Callback function to run after aSync DB call
  * @returns {void}               - It will call Callback function aSync
  */
  function swapFrontendIdToDatabaseId(values, callback) {

    let valuesWithDatabaseId = values.map((obj) => {
      const objBackEnd            = {};
      objBackEnd.objective_id     = objectivesMap[obj.objective_id_frontend];
      objBackEnd.alternative_id   = alternativesMap[obj.alternative_id_frontend];
      objBackEnd.value            = obj.value;
      return objBackEnd
    });

    console.log('Swap front-end ids to backend ids')

    valuesWithDatabaseId.forEach((value, index) => {
      insertValue(value, callback);
    });
  }

  /**
  * Insert an objective to database
  * @param {object}   objective   - All informations about the objective
  * @param {integer}  case_id     - To which case alternatives belongs
  * @param {integer}  order       - Alternative's order
  * @param {object}   values      - all cell values data from frontend
  * @param {function} callback    - Callback function to run after aSync DB call
  * @returns {void}               - It will call Callback function aSync
  */
  function insertObjective(objective, case_id, order, values, callback) {

    knex.insert({
      name:                   objective.objective,
      sub_name:               objective.subObjective,
      case_id:                parseInt(case_id),
      evaluation_objective:   objective.criterion,
      low_is_better:          objective.low_is_better,
      order:                  parseInt(order),
      unit_name:              objective.unit_name,
      unit_prefix:            objective.unit_prefix,
      unit_suffix:            objective.unit_suffix,
    }, 'id')
    .into('objectives')
    .then( (objective_id) => {
      console.log('Insert Objective');

      // Maping id_front-end to the new id from database
      objectivesMap[objective.id_frontend] = objective_id[0];

      // Insert to alternatives_objectives only if all other data is alredy
      // inserted
      if (isDoneInserting()) {
        swapFrontendIdToDatabaseId(values, callback);
      }
    })
    .catch(function(error) { console.error(error); });
  }

  /**
  * Insert an alternative to database
  * @param {object}   alternative - All informations about the alternative
  * @param {integer}  case_id     - To which case alternatives belongs
  * @param {integer}  order       - Alternative's order
  * @param {object}   values      - all cell values data from frontend
  * @param {function} callback    - Callback function to run after aSync DB call
  * @returns {void}               - It will call Callback function aSync
  */
  function insertAlternative(alternative, case_id, order, values, callback) {

    knex.insert({
      case_id:                parseInt(case_id),
      name:                   alternative.name,
      image_url:              alternative.image_url,
      order:                  parseInt(order),
    }, 'id')
    .into('alternatives')
    .then( (alternative_id) => {
      console.log('Insert Alternative');

      // Mapping id_front-end to the new id from database
      alternativesMap[alternative.id_frontend] = alternative_id[0];

      // Insert to alternatives_objectives only if all other data is alredy
      // inserted
      if (isDoneInserting()) {
        swapFrontendIdToDatabaseId(values, callback)
      }
    })
    .catch(function(error) { console.error(error); });
  }

  /**
  * Insert a case
  * @param {object} data        - Json data with all case data
  * @param {function} callback  - Callback function to run after aSync DB call
  * @returns {void}             - It will call Callback function aSync
  */
  function insertCase(data, callback) {

    knex.insert({
      user_id: user_id,
      name: data.name,
      description: data.description
    }, 'id')
    .into('cases')
    .then( (case_id) => {

      // To be track of numbers of aSync request and know when is done
      totalObjectives   = data.objectives.length;
      totalAlternatives = data.alternatives.length;

      console.log('Insert Case');

      // Add Objectives
      data.objectives.forEach((objective, index) => {
        let order = index + 1;
        insertObjective(objective, case_id, order, data.values, callback)
      });

      // Add alternatives
      data.alternatives.forEach((alternative, index) => {
        let order = index + 1;
        insertAlternative(alternative, case_id, order, data.values, callback)
      });


    })
    .catch(function(error) { console.error(error); });
  }

  /**
  * Update entire case. Since all data is already in database is it possible
  * to call all queries at same time.
  * @param {integer} case_id    - Which Case to update
  * @param {object} data        - Json data with all case data
  * @param {function} callback  - Callback function to run after aSync DB call
  * @returns {void} - It will call Callback function aSync
  */
  function updateCase(case_id, data, callback) {

    // Keep track on database operations
    let countCase         = 0;
    let countObjectives   = 0;
    let countAlternatives = 0;
    let countValues       = 0;

    const msg = 'Entire Case Updated';

    /**
    * Check if all database operations was done
    * @returns {boolean}
    */
    function isDoneUpdating () {
      return (countCase == 1) && (countObjectives    == data.objectives.length) && (countAlternatives  == data.alternatives.length) && (countValues        == data.values.length);
    }

    // Update case
    knex('cases')
    .where('id', parseInt(case_id))
    .andWhere('user_id', parseInt(user_id))
    .update(data.case)
    .then((n) => {
      countCase++;
      console.log('Case Updated: ' + n)
      if (isDoneUpdating()) {
        callback(msg);
      }
    });

    // Update objectives
    data.objectives.forEach((objective, index) => {
      knex('objectives')
      .where('id', parseInt(objective.id))
      .andWhere('case_id', parseInt(case_id))
      .update(objective)
      .then((n) => {
        countObjectives++;
        console.log('Objective Updated: ' + n)
        if (isDoneUpdating()) {
          callback(msg);
        }
      });
    });

    // Update alternatives
    data.alternatives.forEach((alternative, index) => {
      knex('alternatives')
      .where('id', parseInt(alternative.id))
      .andWhere('case_id', parseInt(case_id))
      .update(alternative)
      .then((n) => {
        countAlternatives++;
        console.log('Alternative Updated: ' + n)
        if (isDoneUpdating()) {
          callback(msg);
        }
      });
    });

    // Update values
    data.values.forEach((value, index) => {
      knex('alternatives_objectives')
      .where('alternative_id', parseInt(value.alternative_id))
      .andWhere('objective_id', parseInt(value.objective_id))
      .update(value)
      .then((n) => {
        countValues++;
        console.log('Value Updated: ' + n)
        if (isDoneUpdating()) {
          callback(msg);
        }
      });
    });
  }

  function deliverContent (case_id, callback) {

    data = {};

    function isDone() {
      return (data.objectives && data.alternatives && data.cases && data.values);
    }

    knex('objectives')
      .where('case_id', case_id)
      .select()
      .then(function(result) {
        data.objectives = result;
        console.log(data)
      if (isDone()) {
        callback(data);
      }

    });

    knex('cases')
      .where("user_id", user_id)
      .where("id", case_id)
      .select()
      .then(function(result) {
        data.cases = result;
        console.log(data)
      if (isDone()) {
        callback(data);
      }

    });

    knex('alternatives')
      .where("case_id", case_id)
      .select()
      .then(function(result) {
        data.alternatives = result;
      if (isDone()) {
        callback(data);
      }

    });

    knex.from('alternatives_objectives')
      .innerJoin('alternatives','alternatives_objectives.alternative_id','alternatives.id')
      .where("case_id", case_id)
      .then(function(result) {
        data.values = result;
      if (isDone()) {
        callback(data);
      }

    });

  };


  return {
    insertCase,
    updateCase,
    deliverContent
  };
};