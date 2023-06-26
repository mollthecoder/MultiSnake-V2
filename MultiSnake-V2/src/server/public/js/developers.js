function handleButtons(){
    var copy_keys = document.querySelectorAll(".copy-key");
    var copy_uids = document.querySelectorAll(".copy-uid");
    var delete_keys = document.querySelectorAll(".delete-key");
    

    copy_keys.forEach(button=>{
        button = removeListeners(button);
        button.addEventListener("click",handleCopyKey)
    });
    copy_uids.forEach(button=>{
        button = removeListeners(button);
        button.addEventListener("click",handleCopyUid)
    })
    delete_keys.forEach(button=>{
        button = removeListeners(button);
        button.addEventListener("click",handleDeleteRow)
    });
}
handleButtons();
var add_key = document.getElementById("add-key")
add_key.addEventListener("click",handleAddKey)

function handleCopyUid(e){
    var rowNum = e.target.getAttribute('data-row')
    var uid = document.querySelector(`#row-${rowNum} .uid`);
    var button = document.querySelector(`#row-${rowNum} .copy-uid`);

    uid = uid.innerHTML;

    navigator.clipboard.writeText(uid);

    button.innerHTML = "Copied!"

    setTimeout(()=>{
        button.innerHTML = "Copy UID"
    },500)
}
function handleCopyKey(e){
    var rowNum = e.target.getAttribute('data-row')
    var key = document.querySelector(`#row-${rowNum} .apiKey`);
    var button = document.querySelector(`#row-${rowNum} .copy-key`)
    var api_key = key.innerHTML
    // Copy the text inside the text field
    navigator.clipboard.writeText(api_key);

    button.innerHTML = "Copied!"

    setTimeout(()=>{
        button.innerHTML = "Copy Key"
    },500)
}
function handleDeleteRow(e){
    var rowNum = e.target.getAttribute('data-row')
    var key = document.querySelector(`#row-${rowNum} .apiKey`);
    var button = document.querySelector(`#row-${rowNum} .delete-key`);
    var row = document.querySelector("#row-"+rowNum)
    var api_key = key.innerHTML
    var confirmedDelete = ()=>{
        console.log("deleting row "+rowNum);
        row.remove();
        var requestBody = JSON.stringify({
            uid: window.userUID,
            api_key: api_key
        })
        fetch("/deleteKey",{
            method: "DELETE",
            headers:{
                'Content-Type':'application/json'
            },
            body: requestBody
        })
        .then(res=>res.json())
        .then((json)=>{
            displayNotif(`${api_key} successfully deleted`,"green")
        })
        .catch((err)=>{
            displayNotif(err.message,"red");
            console.error(err)
        })
    }
    button.style.backgroundColor = "red";
    button.style.border = "1px solid red";
    button.innerHTML = "Confirm delete?"
    button.addEventListener("click",confirmedDelete)
}
async function handleAddKey(e){
    var requestBody = JSON.stringify({
        uid: window.userUID
    })
    var response = await fetch("/newAPIKey",{
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: requestBody
    });
    var data = await response.json();
    var rowNum = document.querySelectorAll(".table-row").length;
    var tr = document.createElement("tr");
    tr.classList.add("table-row");
    tr.id = "row-"+rowNum
    
    var rowID = document.createElement("td");
    var rowIDBold = document.createElement("b");
    var rowIDText = document.createTextNode(rowNum);

    rowIDBold.appendChild(rowIDText);
    rowID.appendChild(rowIDBold);
    tr.appendChild(rowID);

    var rowKey = document.createElement("td");
    rowKey.classList.add("apiKey");
    var rowKeyText = document.createTextNode(data.key);
    rowKey.appendChild(rowKeyText);
    tr.appendChild(rowKey);

    var rowUID = document.createElement("td");
    rowUID.classList.add("uid");
    var rowUIDText = document.createTextNode(data.botUid);
    rowUID.appendChild(rowUIDText);
    tr.appendChild(rowUID);

    var rowManage = document.createElement('td');
    var copyButton0 = document.createElement('button');
    var copyButton1 = document.createElement('button')
    var deleteButton = document.createElement('button');

    copyButton0.classList.add("btn");
    copyButton0.classList.add('btn-inline');
    copyButton0.classList.add('copy-key');
    copyButton0.setAttribute('data-row',rowNum);
    var copyButton0Text = document.createTextNode("Copy Key");
    copyButton0.appendChild(copyButton0Text);

    rowManage.appendChild(copyButton0);

    copyButton1.classList.add("btn");
    copyButton1.classList.add('btn-inline');
    copyButton1.classList.add('copy-uid');
    copyButton1.setAttribute('data-row',rowNum);
    var copyButton1Text = document.createTextNode("Copy UID");
    copyButton1.appendChild(copyButton1Text);

    rowManage.appendChild(copyButton1);

    deleteButton.classList.add('btn');
    deleteButton.classList.add('btn-inline');
    deleteButton.classList.add('btn-danger');
    deleteButton.classList.add('delete-key');
    deleteButton.setAttribute('data-row',rowNum);
    var deleteButtonText = document.createTextNode('Delete');
    deleteButton.appendChild(deleteButtonText);

    rowManage.appendChild(deleteButton);

    tr.appendChild(rowManage);

    var tbody = document.querySelector('table tbody');
    tbody.appendChild(tr);

    handleButtons();
    handleRes(data)
}
