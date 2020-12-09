$(document).ready(function () {
    var bash_tags = document.querySelectorAll("code.language-bash")
    bash_tags.forEach(
        function (currValue, currIndex, listObj) {
            currValue.innerHTML="<span class='bash'>"+(currValue.textContent.split("\n").filter(Boolean).join("</span>\n<span class='bash'>"))+"</span>";
        },
    );
});