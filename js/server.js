const firebaseConfig = {
    apiKey: "AIzaSyBz4_WjRPHYDkMQhtNoqqlFVajTdgWlXkg",
    authDomain: "dacs4-c040a.firebaseapp.com",
    projectId: "dacs4-c040a",
    storageBucket: "dacs4-c040a.appspot.com",
    messagingSenderId: "16357444641",
    appId: "1:16357444641:web:0f4e1f6f70d79b439c6760"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics()

  const getDB= firebase.database()
  const storage = firebase.storage();
  var usersRef = getDB.ref('users');
  var newsRef = getDB.ref('news');
  var historiesRef = getDB.ref('histories');
  var savedPagesRef = getDB.ref('saved_pages');
  var newsImageRef = storage.ref('news');

  $('#main_menu .item').click(function(){
    $(this).addClass('active').css('pointer-events','none').siblings().removeClass('active').css('pointer-events','visible')
$('#main_content').transition('hide').transition('fade')
;
})

  function loadUsers(){
    $('table').html(`<h1 style="padding:20px">Vui lòng đợi...</h1>`)
      usersRef.on('value',(snapshot)=>{
    let user=`
    <thead>
    <tr><th colspan="5" style="font-size:25px">QUẢN LÝ NGƯỜI DÙNG</th>
  </tr></thead>
    <thead>
    <tr><th>Tên tài khoản</th>
    <th>Email</th>
    <th colspan="3">Tùy chọn</th>
  </tr></thead>
  <tbody>`
    snapshot.forEach(snap_child=>{
user+=`<tr>
<td>${snap_child.val().name}</td>
<td>${snap_child.val().email}</td>
<td><button class="ui blue button" onclick="loadUserHistories('${snap_child.val().name}')">Xem lịch sử duyệt web</button></td>
<td><button class="ui green button" onclick="loadUserSavedPages('${snap_child.val().name}')">Xem trang đã lưu</button></td>
<td><button onclick="userPermission('${snap_child.val().name}')" class="ui `
if(snap_child.val().permission==1){
   user+=`red button">Khóa tài khoản`
}else{
    user+=`orange button">Mở khóa tài khoản`
}
user+=`</button></td></tr>`
    })
    user+=`</tbody>`
    $('table').html(user)
    $('.users.item').addClass('active')
  })
  }

  function loadNews(){
    $('table').html(`<h1 style="padding:20px">Vui lòng đợi...</h1>`)
    newsRef.on('value',(snapshot)=>{
  let html=`
  <thead>
  <tr><th colspan="4" style="font-size:25px">QUẢN LÝ TIN TỨC<br></br><button onclick="addNew()" class="ui green button">Thêm tin tức</button></th>
</tr></thead>
  <thead>
  <tr><th>Hình ảnh</th>
  <th>Đường dẫn</th>
  <th colspan="2">Tùy chọn</th>
</tr></thead>
<tbody>`
  snapshot.forEach(snap_child=>{
    html+=`<tr>
<td><img src="${snap_child.val().img}" style="height:50px;width:50px"></td>
<td>${snap_child.val().url}</td>
<td><button class="ui blue button" onclick="editNew('${snap_child.key}')">Cập nhật</button></td>
<td><button class="ui red button" onclick="deleteNew('${snap_child.key}','${(snap_child.val().img_name)}')">Xóa</button></td>
</tr>`
  })
  html+=`</tbody>`
  $('table').html(html)
})
}
loadUsers()

function addNew(){
    let html=`<center style="padding:20px">
    <h2>Thêm tin tức</h2>
    <form class="ui form" id="new_form">
    <div class="field">
    <label>Hình ảnh</label>
    <img id="new_image_display" src="" style="height:100%;width:100%;object-fit:cover;display:none" >
      <input type="file" id="new_image" accept="image/png, image/jpeg">
    </div>
    <div class="field">
      <input type="text" id="new_url" placeholder="Đường dẫn tin tức">
    </div>
    <button class="ui green button" type="submit">Thêm</button>
  </form></center>`
  $('.ui.flyout').html(html).flyout('toggle')
  $('#new_image').change(function (event) {
    var tmppath = URL.createObjectURL(event.target.files[0]);
    if(tmppath){
        $('#new_image_display').show()
        document.getElementById('new_image_display').src=tmppath
    }
  })
  document.getElementById('new_form').onsubmit=(event)=>{
    event.preventDefault();
    var img=document.getElementById('new_image').files[0]
    var url=$('#new_url').val()
    var imgName=String(img.name)
        let exist_img_count=0;
    if(url && img){

    newsRef.get().then(new_snapshot=>{
        new_snapshot.forEach(new_snap_child=>{
            if(new_snap_child.val().img_name==imgName){
                 exist_img_count+=1;
            }
        })
       if(exist_img_count==1){
        alert('Tin tức này đã tồn tại')
       }else{
        $('.ui.flyout').html('<h1 class="ui center aligned header">Vui lòng đợi...</h1>')
        newsImageRef.child(imgName).put(img).then(() => {
        newsImageRef.child(imgName).getDownloadURL()
        .then((img_url) => {
            newsRef.push({
                img_name:imgName,
                img:img_url,
                url:url
            }).then(()=>{
                   alert('Thêm tin tức thành công !')
                   $('.ui.flyout').flyout('hide')
            })
        }).catch((error) => {
            alert(error)
          });
       
      });
       }
    })
    }else{
        alert('Vui lòng điền đầy đủ thông tin')
    }
  }
}

function editNew(new_key){
    let waiting_header=`<h1 class="ui center aligned header">Vui lòng đợi...</h1>`
    $('.ui.flyout').html(waiting_header).flyout('toggle')
    newsRef.child(new_key).get().then((snapshot)=>{
        let html=`<center style="padding:20px">
    <h2>Cập nhật tin tức</h2>
    <form class="ui form" id="new_form">
    <div class="field">
    <label>Hình ảnh</label>
    <img id="new_image_display" src="" style="height:100%;width:100%;object-fit:cover" >
    </div>
    <div class="field">
    <label>Đường dẫn tin tức</label>
      <input type="text" id="new_url" placeholder="Đường dẫn tin tức" value="${snapshot.val().url}">
    </div>
    <button class="ui green button" type="submit">Cập nhật</button>
  </form></center>`
  $('.ui.flyout').html(html)
  document.getElementById('new_image_display').src=snapshot.val().img

  document.getElementById('new_form').onsubmit=(event)=>{
    event.preventDefault();
    var url=$('#new_url').val()
    if(url){
        newsRef.child(new_key).update({
            img:img_url,
            url:url
        }).then(()=>{
            alert('Cập nhật tin tức thành công !')
            $('.ui.flyout').flyout('hide')
        })

    }else{
        alert('Vui lòng điền đầy đủ thông tin')
    }
  }
    })
}

function deleteNew(new_key,imgName){
    newsRef.child(new_key).remove().then(()=>{
        newsImageRef.child(imgName).delete();
    });
}


function loadUserHistories(user){
    historiesRef.on('value',(snapshot)=>{
        const historiesData=[]
        snapshot.forEach(snap_child=>{
            historiesData.push(snap_child.val())
        })
        historiesData.sort((a, b) => {
            let idA=a.id
            let idB=b.id
             return idA==idB ? 0 : idA < idB ? 1 : -1;
          });
        let histories=`<div class="ui center aligned header">
        <div class="content">
         Lịch sử duyệt web của ${user}
        </div>
      </div>
      <div class="content" style="padding:10px">
      <div class="ui inverted segment">
          <div class="ui inverted relaxed divided list" style="height:80vh;overflow-y:scroll">`
          historiesData.forEach(snap_child=>{
            if(snap_child.user==user){
histories+=`<div class="item">
<i class="large blue clock outline icon"></i>
<div class="content">
  <div class="header">${snap_child.name}</div>
  <div class="description">${snap_child.time}</div>
</div>
</div>`
            }
        })
        histories+=`</div></div></div>`
        $('.ui.flyout').html(histories)
        $('.ui.flyout').flyout('toggle');
    })
}

function userPermission(user){
    const userRefByName=usersRef.child(user);
    userRefByName.get().then((snapshot)=>{
        if(snapshot.val().permission==1){
           userRefByName.update({ permission:0 })
        }else{
            userRefByName.update({ permission:1 })
        }
    })

}

function loadUserSavedPages(user){
    savedPagesRef.on('value',(snapshot)=>{
        let saved_pages=`<div class="ui center aligned header">
        <div class="content">
         Các trang đã lưu của ${user}
        </div>
      </div>
      <div class="content" style="padding:10px">
      <div class="ui inverted segment">
          <div class="ui inverted relaxed divided list" style="height:80vh;overflow-y:scroll">`
          snapshot.forEach(snap_child=>{
            if(snap_child.val().user==user){
                saved_pages+=`<div class="item">
<i class="large blue star icon"></i>
<div class="content">
  <div class="header">${snap_child.val().name}</div>
</div>
</div>`
            }
        })
        saved_pages+=`</div></div></div>`
        $('.ui.flyout').html(saved_pages)
        $('.ui.flyout').flyout('toggle');
    })
}
