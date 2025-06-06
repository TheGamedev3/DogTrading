// Site/Tools/helpers.js

window.onStart=function(func){

    function DynamicEJSelements(...ids){
        function createInstance(id){
            return{
                set({
                    visible,
                    color, background,
                    text,
                    disabled, enabled
                }){
                    const el = document.getElementById(id);
                    if (!el) return;
                    if (visible !== undefined) el.style.display = visible ? "" : "none";
                    if (background) el.style.backgroundColor = background;
                    if (color) el.style.color = color;
                    if (text !== undefined) el.textContent = text;

                    let bool = undefined;
                    if(disabled !== undefined){bool = disabled;}
                    if(enabled !== undefined){bool = !disabled}
                    if(bool !== undefined){el.disabled = bool}
                },

                onClick(func){
                    const button = document.getElementById(id);
                    button.addEventListener('click', func);
                }
            }
        }
        return ids.map(createInstance);
    }

    document.addEventListener('DOMContentLoaded', () => {
        func({DynamicEJSelements});
    });

    // optionally, await for definitions to be established
    // then add in functions outside to change bools the states have
}

