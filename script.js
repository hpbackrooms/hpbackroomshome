const uniform = document.getElementById("uniform");
const signupModal = document.getElementById("signupModal");
const loginModal = document.getElementById("loginModal");

const logout = document.getElementById("logout")

const signupUsername = document.getElementById("signupUsername");
const signupPassword = document.getElementById("signupPassword");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");

const postButton = document.getElementById("postButton");

const supabaseUrl = "https://cjjgtktkxrwgdbeyjpcz.supabase.co";
const supabaseKey = "sb_publishable_MRhm2m5-QPRrR9lRcTRUTw_i29sT6y3";

const client = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

async function loadPosts() {
  const postList = document.getElementById("postList");

  postList.textContent = "게시글을 불러오는 중...";

  const {data, error} = await client
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("게시글 불러오기 실패:", error);
    postList.textContent = "게시글을 불러오지 못했습니다.";
    return;
  }

  postList.replaceChildren();

  if (data.length === 0) {
    postList.textContent = "아직 게시글이 없습니다.";
    return;
  }

  data.forEach(post => {
    const article = document.createElement("div");
    article.className = "article";

    const title = document.createElement("button");
    title.className = "postTitle";
    title.textContent = post.title + " / " + post.author;

    title.style.background = "none";
    title.style.border = "none";
    title.style.margin = "5px";
    title.style.textAlign = "left";
    title.style.width = "100%";


    title.addEventListener("click", async () => {
      const {data: authData, error: authError} = await client.auth.getUser();
        if (authError || !authData.user) {
        alert("로그인이 필요합니다.");
        return;
      }

      const {data: userData, error: userError} = await client
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      // console.log("사용자 데이터:", userData);
      // console.log("사용자 조회 오류:", userError);
      // console.log("사용자 UUID:", authData.user.id);

      if (userData.role != "admin" && userData.role != "owner") {
        alert("관리자가 아닌 사람은 글을 열람할 수 없습니다.");
        return;
      }

      document.getElementById("postTitle").textContent =
        post.title;

      document.getElementById("postAuthor").textContent =
        "작성자: " + post.author;

      document.getElementById("postDate").textContent =
        new Date(post.created_at).toLocaleString("ko-KR");

      document.getElementById("postContent").textContent =
        post.content;

      document.getElementById("postDialog").showModal();
    });

    article.appendChild(title);
    postList.appendChild(article);
  });
}

loadPosts();

//유나폼
document.getElementById("openUniform").addEventListener("click", () => {
  uniform.showModal();
});

document.getElementById("close").addEventListener("click", () => {
  uniform.close();
});

//글
document.getElementById("closePost").addEventListener("click", () => {
  document.getElementById("postDialog").close();
});

//회원가입, 로그인
document.getElementById("openSignup").addEventListener("click", () => {
  signupModal.showModal();
});

document.getElementById("closeSignup").addEventListener("click", () => {
  signupModal.close();
});

document.getElementById("openLogin").addEventListener("click", () => {
  loginModal.showModal();
});

document.getElementById("closeLogin").addEventListener("click", () => {
  loginModal.close();
});

//회원가입 과정
document.getElementById("signup").addEventListener("click", async () => {

  const usernameValue = signupUsername.value.trim();
  const passwordValue = signupPassword.value;

  const spaceInInfo = /\s/.test(usernameValue) || /\s/.test(passwordValue);
  const lengthProblem = ((usernameValue.length <= 2) || (passwordValue.length <= 7)) || ((usernameValue.length >= 13) || (passwordValue.length >= 16));

  if (spaceInInfo || lengthProblem) {
    alert(`
      유저네임이나 비밀번호의 형식이 잘못되었습니다.
      -띄어쓰기가 포함됨
      -유저네임이나 비밀번호가 너무 김
      -유저네임이나 비밀번호가 너무 짧음
      기준 : 유저네임 3자 이상 12자 이하, 비밀번호 8자 이상 15자 이하  
    `);
    return;
  }

  const email = usernameValue + "@hpbackrooms.com";
  const {data, error} = await client.auth.signUp({
    email: email,
    password: passwordValue,
    options: {
      data: {
        username: usernameValue
      }
    }
  });

  if (error) {
    console.log("오류 코드:", error.code);
    console.log("오류 메시지:", error.message);
    console.log("오류 상태:", error.status);


    if (error.code === "user_already_exists") {
      alert("이미 사용 중인 유저네임입니다.");
    } else {
      alert("유저네임이나 비밀번호를 한국어로 설정할 수 없습니다.");
    }
    return;
  }

  alert("회원가입에 성공하였습니다.");
});

//로그인 과정
document.getElementById("login").addEventListener("click", async () => {
  const usernameValue = loginUsername.value.trim();
  const passwordValue = loginPassword.value;

  const email = usernameValue + "@hpbackrooms.com";
  const {data, error} = await client.auth.signInWithPassword({
    email: email,
    password: passwordValue
  });

  if (error) {
    alert("로그인에 실패하였습니다.");
    return;
  }

  alert("로그인에 성공하였습니다.");
});

logout.addEventListener("click", async () => {
  const {error} = await client.auth.signOut();

  if (error) {
    alert("로그아웃에 실패하였습니다.");
    return;
  }

  alert("로그아웃되었습니다.");
});

//로그인->각종단추들
client.auth.onAuthStateChange((event, session) => {
  if (session) {
    logout.style.display = "block";
    postButton.style.display = "block";
  } else {
    logout.style.display = "none";
    postButton.style.display = "none";
  }
});

//글쓰기 기능
postButton.addEventListener("click", async () => {
  const {data: authData, error: authError} = await client.auth.getUser();
  if (authError || !authData.user) {
    alert("로그인이 필요합니다.");
    return;
  }

  const {data: userData, error: userError} = await client
    .from("users")
    .select("*")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (userData.role != "admin" && userData.role != "owner") {
    alert("관리자가 아닌 사람은 글을 작성할 수 없습니다.");
    return;
  }

  const {data, error} = await client.auth.getUser();

  if (error || !data.user) {
    console.log(error);
    return;
  }

  const user = data.user;

  let titleValue = prompt("글의 제목을 기입해 주세요.");
  let contentValue = prompt("글의 내용을 기입해 주세요.");

  if (!titleValue || !contentValue) return;

  const {error: postError} = await client
    .from("posts")
    .insert({
      title: titleValue,
      content: contentValue,
      author: userData.username
    });

    alert("글을 작성하였습니다.");
    loadPosts();
});