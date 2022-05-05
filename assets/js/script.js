var taskIdCounter = 0;

var formEl = document.querySelector("#task-form");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");
var pageContentEl = document.querySelector("#page-content");
// create empty array to hold saved (loaded) tasks
var tasks = [];

var taskFormHandler = function (event) {
  event.preventDefault();
  var taskNameInput = document.querySelector("input[name='task-name']").value;
  var taskTypeInput = document.querySelector("select[name='task-type']").value;

  // check if inputs are empty (validate)
  if (taskNameInput === "" || taskTypeInput === "") {
    alert("You need to fill out the task form!")
    return false;
  }
  // reset (clear) form fields so next task can be entered
  document.querySelector("input[name='task-name']").value = "";
  document.querySelector("select[name='task-type']").selectedIndex = 0;

  // check for existence of data attribute in order to distinguish btw new/edited tasks
  var isEdit = formEl.hasAttribute("data-task-id");
  // has data attribute, so get task id and call the function that saves changes and completes the editing process
  if (isEdit) {
    var taskId = formEl.getAttribute("data-task-id");
    completeEditTask(taskNameInput,taskTypeInput,taskId);
    // no data attribute, so create data-object reference as normal and pass to the existing function that creates new task
  } else {
    // package up data as an object
    var taskDataObj = {
      name: taskNameInput,
      type: taskTypeInput,
      status: "to do"
    };
    // send data object (as an argument) to be created
    createTaskEl(taskDataObj);
  }
};

var createTaskEl = function (taskDataObj) {
  // create list item and add task id as a custom attribute (property)
  var listItemEl = document.createElement("li");
  listItemEl.className = "task-item";
  listItemEl.setAttribute("data-task-id",taskIdCounter)

  // create <div> to hold task info and add to list item
  var taskInfoEl = document.createElement("div");
  taskInfoEl.className = "task-info";
  // add HTML content to <div>
  taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";
  listItemEl.appendChild(taskInfoEl);

  // create task actions (btns/select menu) for task
  var taskActionsEl = createTaskActions(taskIdCounter);
  listItemEl.appendChild(taskActionsEl);
  // add entire list item (task with inserted form data) to list
  switch (taskDataObj.status) {
    case "to do":
      taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 0;
      tasksToDoEl.append(listItemEl);
      break;
    case "in progress":
      taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 1;
      tasksInProgressEl.append(listItemEl);
    case "completed":
      taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 2;
      tasksCompletedEl.append(listItemEl);
    default:
      console.console.log("Something went wrong!");
  }
  // save task as an object with name, type, status, and id properties then push it into tasks array
  taskDataObj.id = taskIdCounter;

  tasks.push(taskDataObj);

  saveTasks();
  // increase task counter for next unique <id>
  taskIdCounter++;
};

var createTaskActions = function (taskId) {
  // create container to hold elements
  var actionContainerEl = document.createElement("div");
  actionContainerEl.className = "task-actions";

  // create edit button
  var editButtonEl = document.createElement("button");
  editButtonEl.textContent = "Edit";
  editButtonEl.className = "btn edit-btn";
  editButtonEl.setAttribute("data-task-id",taskId);
  actionContainerEl.appendChild(editButtonEl);

  // create delete button
  var deleteButtonEl = document.createElement("button");
  deleteButtonEl.textContent = "Delete";
  deleteButtonEl.className = "btn delete-btn";
  deleteButtonEl.setAttribute("data-task-id",taskId);
  actionContainerEl.appendChild(deleteButtonEl);

  // create task status dropdown  (menu)
  var statusSelectEl = document.createElement("select");
  statusSelectEl.className = "select-status";
  statusSelectEl.setAttribute("name","status-change");
  statusSelectEl.setAttribute("data-task-id",taskId);
  actionContainerEl.appendChild(statusSelectEl);

  // create an array of status expressions
  var statusChoices = ["To Do","In Progress","Completed"];

  for (var i = 0; i < statusChoices.length; i++) {
    // create option element
    var statusOptionEl = document.createElement("option");
    statusOptionEl.textContent = statusChoices[i];
    statusOptionEl.setAttribute("value",statusChoices[i]);
    // append to select
    statusSelectEl.appendChild(statusOptionEl);
  }

  return actionContainerEl;
};

var completeEditTask = function (taskName,taskType,taskId) {
  // find the matching task list item with value of taskId
  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );
  // set new values
  taskSelected.querySelector("h3.task-name").textContent = taskName;
  taskSelected.querySelector("span.task-type").textContent = taskType;

  // loop through tasks array and task object with new content
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === parseInt(taskId)) {
      tasks[i].name = taskName;
      tasks[i].type = taskType;
    }
  }

  alert("Task Updated!");
  // remove data attribute from form
  formEl.removeAttribute("data-task-id");
  // update formEl button to go back to saying "Add Task" instead of "Edit Task"
  formEl.querySelector("#save-task").textContent = "Add Task";

  saveTasks();
};

var taskButtonHandler = function (event) {
  // get target element from event
  var targetEl = event.target;

  // edit button was clicked: get the element's task id and edit task item
  if (targetEl.matches(".edit-btn")) {
    console.log("edit", targetEl);
    var taskId = targetEl.getAttribute("data-task-id");
    editTask(taskId);
    // delete button was clicked: get the element's task id and delete task item
  } else if (targetEl.matches(".delete-btn")) {
    console.log("delete", targetEl);
    var taskId = targetEl.getAttribute("data-task-id");
    deleteTask(taskId);
  }
};

var taskStatusChangeHandler = function(event) {
  console.log(event.target.value);
  // get the task item's "id" to find task list item
  var taskId = event.target.getAttribute("data-task-id");
  // the parent task's element based on the "id"
  var taskSelected = document.querySelector(".task-item[data-task-id;" + taskId + "']");
  // get the currently selected option's value and convert to lowercase
  var statusValue = event.target.value.toLowerCase();

  if (statusValue === "to do") {
    tasksToDoEl.appendChild(taskSelected);
  } else if (statusValue === "in progress") {
    tasksInProgressEl.appendChild(taskSelected);
  } else if (statusValue === "completed") {
    tasksCompletedEl.appendChild(taskSelected);
  }
  // update tasks in tasks array
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id = parseInt(taskId)) {
      tasks[i].status = statusValue;
    }
  }

  saveTasks();
};

var editTask = function (taskId) {
  console.log("editing task #" + taskId);

  // get task list item element
  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );
  // get content from task name and type (data-* attribute not needed)
  var taskName = taskSelected.querySelector("h3.task-name").textContent;
  console.log(taskName);

  var taskType = taskSelected.querySelector("span.task-type").textContent;
  console.log(taskType);

  // load (write) values of taskname and taskType to form fields
  document.querySelector("input[name='task-name']").value = taskName;
  document.querySelector("select[name='task-type']").value = taskType;
  // set up "id" (attribute/property) to the form with name/value of the task's id for ablity to decipher which task is being edited upon resubmit
  formEl.setAttribute("data-task-id",taskId);
  // update form's button to reflect editing a task rather than creating a new one
  formEl.querySelector("#save-task").textContent = "Save Task";
};

var deleteTask = function (taskId) {
  console.log(taskId);
  // find task list element with taskId value and remove it
  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );
  taskSelected.remove();

  // create new array to hold updated list of tasks
  var updatedTaskArr = [];
  // loop through current tasks
  for (var i = 0; i < tasks.length; i++) {
    // if tasks[i].id doesn't match the value of taskId, keep that task and push it into the new array
    if (tasks[i].id !=== parseInt(taskId)) {
      updatedTaskArr.push(tasks[i]);
    }
  }
  // reassign tasks array to be the smar as updatedTaskArr
  tasks = updatedTaskArr;

  saveTasks();
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

var loadTasks = function() {
  var savedTasks = localStorage.getItem("tasks");
  // if there are no tasks, set tasks to an empty array and return out of the function
  if (!savedTasks) {
    return false;
  }
  // else, load up saved tasks and parse into array of objects
  savedTasks = JSON.parse(savedTasks);

  // loop through savedTasks array
  for (var i = 0; i < savedTasks.length; i++) {
    // pass each task object into the task-creation function
    createTaskEl(savedTasks[i]);
  }
};

// logic for creating a new task
formEl.addEventListener("submit", taskFormHandler);
// logic for edit and delete buttons
pageContentEl.addEventListener("click", taskButtonHandler);
// logic for changing the status
pageContentEl.addEventListener("change", taskStatusChangeHandler);

loadTasks();
