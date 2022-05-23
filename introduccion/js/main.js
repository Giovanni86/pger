// Course Data

// Scroll
let controller = null;
let position = 1;
let current = '#Page1';
let cant = structure.pages.length;
let mousewheelumbral = 0;
let mc = null;
let navId = 1;
let layerMain = document.getElementById('LayerMain');
let scrollSpeed = 2000;
let audio = document.getElementById('Player');

// Resize
let basePage = { width: 1920, height: 1080, scale: 1 }

let $scaleAnimationParent = $('.container-animation')
    $scaleAnimation = $('.scale-animation'),
    scaleAnimationHeight = $scaleAnimation.outerHeight(),
    scaleAnimationWidth = $scaleAnimation.outerWidth();

function start() {
    // let initialId = window.location.hash.length > 0 ? window.location.hash : '#Page2';
    let initialId = current;
 
    $.ajaxSetup({
        beforeSend: function(xhr, status) {
            //let perc = Math.floor((100 / cant) * position);
            //document.querySelector('.fill').style.width = perc + '%';
            //document.querySelector('.fill').innerHTML = perc + '%';
            if(position > 1)
            {
                $('footer').addClass('d-flex');
            }
            else{
                $('footer').removeClass('d-flex');
            }

        },
        complete: function() {
            fn_resize();
            $('[data-toggle="popover"]').popover();
            

        }
    });  


    fn_draw();
    fn_goTo(initialId);
}

function fn_draw(){
    let htmlMenu = '';
    for(let i = 0; i < structure.pages.length; i++)
    {
        let pos = i+1;
        let id = 'Page'+pos;
        let urlMenu = '#Page' + structure.pages[i].id;
        let itemMenu = structure.pages[i].itemMenu;
     
        if(itemMenu =='')
            continue;
        htmlMenu += '<li class="btn-menu-item" data-page="'+urlMenu+'">'+itemMenu+'</li>';
    }
    $('.pagination .p-total').html(structure.pages.length);

    $('#MenuList').html(htmlMenu);
}

function setEvents(){

    $(document).on('click', 'a[href^="#"]', function(e) {
        let id = $(this).attr('href');
        if(id.length > 0){
            e.preventDefault();
            fn_goTo(id);
        }
    });

    $(window).on('resize', fn_resize);

    $(document).on('keydown', function(ev){
       
        // Fecha derecha
        if(ev.keyCode == 37) {
            if(position <= 1){
                return 0;
            }
            tmpPos = position - 1;
            fn_goTo('#Page'+tmpPos);
        }

        // Flecha Izquierda
        if(ev.keyCode == 39) {
            if(position == cant){
                return 0;
            }
            tmpPos = position + 1;
            fn_goTo('#Page'+tmpPos);
        }



    });

    $('body').on('click', '.btn-modal', function(){
        let modalId = $(this).attr('data-modal');
        $(modalId).addClass('active');
    });

    $('body').on('click', '.btn-close-modal', function(){
        $('.modal').removeClass('active');
        pauseAudioAndVideo();
    });

    $('body').on('click', '.close-menu', function(){
        $('.container-menu').removeClass('active');
        $('.btn-menu').removeClass('active');
    });

    $('body').on('click', '.btn-menu', function(){
        let isActive = $(this).hasClass('active');
        let elem = document.querySelector("body");
        
        if(!isActive){
            /*$(this).addClass('active');*/
            $('.container-menu').addClass('active');
        }
        else{
            $(this).removeClass('active');
            $('.container-menu').removeClass('active');
        }
    });

    $('body').on('click', '.btn-menu-item', function(){
        let PageId = $(this).attr('data-page');
        $('.menu').removeClass('active');
        $('.container-menu').removeClass('active');   
        fn_goTo(PageId);
    });


    $('body').on('click', '.btn-prev', function(){
        let page = '#Page';
        let number = position-1;
        let PageId = page+number;

        if(position <= 1){
            return 0;
        }

        fn_goTo(PageId);
    });

    $('body').on('click', '.btn-next', function(){
        let page = '#Page';
        let number = position+1;
        let PageId = page+number;

        if(position == cant){
            return 0;
        }

        fn_goTo(PageId);
    });

    $('body').on('click', '.tab', function() {
        let idx = $(this).attr('data-tab');
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        $(this).parent().siblings('.tabs-body').children('.content-tab').removeClass('active');
        $(this).parent().siblings('.tabs-body').children('.content-tab[data-tab="'+idx+'"]').addClass('active');
    });

    $('body').on('click',  function(e) {
        if ($(e.target).data('toggle') !== 'popover' && $(e.target).parents('.popover.in').length === 0) { 
            $('[data-toggle="popover"]').popover('hide');
        }
    });

    $('body').on('click', '.btn-audio', playAudio);
}


function fn_resize(){
    let screenWidth, screenHeight, scaleWidth, scaleHeight;
        screenWidth = $(window).width();
        screenHeight = $(window).height();
        scaleWidth = screenWidth / basePage.width;
        scaleHeight = screenHeight / basePage.height;

    if(scaleWidth <= 1 || scaleHeight <= 1)
    {
        basePage.scale = Math.min(scaleWidth, scaleHeight);  
    }
    else {
        basePage.scale = 1;
    }

    $('.content-page-xxx').css('transform', 'scale('+ basePage.scale +')');
}

function fn_goTo(id){    
    current = id;
    position = parseInt(id.substr(5, id.length));
    viewed[position-1] = 1;

    $('.pagination .p-current').html(position);
    $('.navigation').removeClass('active');
    
    $('.container-main').attr('data-position', id);
    $('.container-background-fixed').attr('data-position', id);
    $('.container-animation').attr('data-position',id);

    $('.navigation a').removeClass('active');
    $('a[href="'+id+'"]').addClass('active');

    loadPage(id);

    if(position <= 1)
    {
        $('.btn-prev').hide();
    }
    else{
        $('.btn-prev').fadeIn();
    }

    if(position == structure.pages.length)
    {
        $('.btn-next, .btn-audio, .btn-menu').css({'display': 'none'});
        $('.btn-credits').fadeIn();
        $('.pagination').hide();
    }
    else{
        $('.btn-next, .btn-audio, .btn-menu').css({'display': 'block'});
        $('.btn-credits').hide();
        $('.pagination').fadeIn();
    }

    if (window.history && window.history.pushState) {
        history.pushState("", document.title, id);
    }    
}

function loadPage(){
    if(structure.pages[position-1].track !== '')
    {
        $('.btn-audio').addClass('active');
    }
    else
    {
        $('.btn-audio').removeClass('active');
    }

    audio.pause();
    audio.current = 0;
    $('#LayerMain').load('html/'+ position + '.html');
}

function pauseAudioAndVideo(){
    document.querySelectorAll('video').forEach(function(element) {
        element.pause();
    });

    document.querySelectorAll('audio').forEach(function(element) {
        element.pause();
    });
}

function playAudio(){
    $(this).toggleClass('playing');
    if(structure.pages[position-1].track !== '')
    {
        audio.src = 'audios/audio'+position+'.mp3';
        if (audio.duration > 0 && !Audio.paused) {
            audio.pause();
        } else {
            audio.play();
        }
        
    }
}