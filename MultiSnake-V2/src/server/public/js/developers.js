var copy_keys = document.querySelectorAll(".copy-key")
var delete_keys = document.querySelectorAll(".delete-key")

copy_keys.forEach(button=>{
    button.addEventListener("click",(e)=>{
        handleCopyRow(e.target.getAttribute("data-row"))
    })
});
delete_keys.forEach(button=>{
    button.addEventListener("click",(e)=>{
        handleDeleteRow(e.target.getAttribute("data-row"));
    })
});

function handleCopyRow(rowNum){
    var key = document.querySelector(`#row-${rowNum} .uid`);
    var button = document.querySelector(`#row-${rowNum} .copy-key`)
    var api_key = key.innerHTML
    // Copy the text inside the text field
    navigator.clipboard.writeText(api_key);

    button.innerHTML = "Copied!"

    setTimeout(()=>{
        button.innerHTML = "Copy Key"
    },500)
}
function handleDeleteRow(rowNum){
    var key = document.querySelector(`#row-${rowNum} .uid`);
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
            method: "POST",
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