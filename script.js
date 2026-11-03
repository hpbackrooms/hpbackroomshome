const uniform = document.getElementById("uniform");
const signupModal = document.getElementById("signupModal");
const loginModal = document.getElementById("loginModal");

const signupUsername = document.getElementById("signupUsername");
const signupPassword = document.getElementById("signupPassword");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");

const supabaseUrl = "https://cjjgtktkxrwgdbeyjpcz.supabase.co";
const supabaseKey = "sb_publishable_MRhm2m5-QPRrR9lRcTRUTw_i29sT6y3";

const client = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

async function loadPosts() {
  const postList = document.getElementById("postList");

  postList.textContent = "게시글을 불러오는 중...";

  const { data, error } = await client
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
    title.textContent = post.title;

    title.style.background = "none";
    title.style.border = "none";
    title.style.margin = "5px";
    title.style.textAlign = "left";
    title.style.width = "100%";


    title.addEventListener("click", () => {
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
document.getElementById("signup").addEventListener("click", () => {
  const usernameValue = signupUsername.value;
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

  alert("회원가입에 성공하였습니다.");
});