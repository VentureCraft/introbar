$().ready(function () {

    // kickstart foundation
    $(document).foundation({
        equalizer: {
            // Specify if Equalizer should make elements equal height once they become stacked.
            equalize_on_stack: false
        }
    });

    // bezier curve
    var easingSwiftOut = [.55, 0, .1, 1];
    var easingSwiftIn = [.9, 0, .45, 1];

    $('input[type=color]').spectrum({
        preferredFormat: "hex",
        chooseText: "Select",
        showInitial: true,
        clickoutFiresChange: true,
        showInput: true
    });


    $('.wysiwyg').redactor({
        buttons: ['bold', 'italic', 'link'],
        tabKey: false
    });

    $(".delete-action").click(function (e) {
        e.preventDefault();

        var popup = $(this).attr('data-popup');
        var id = $(this).attr('data-id');

        $("#"+popup + " #delete-id").val(id);
        $("#"+popup).foundation('reveal', 'open');
    });

});