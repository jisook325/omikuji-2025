// 1) 운세 데이터 정의
// 실제 이미지 파일명/경로는 작가님 리소스에 맞게 수정
const fortunes = [
  {
    key: "fortune1",
    title: "대길",
    desc: "오늘은 모든 일이 술술 풀리는 날! 새로운 시도를 해보세요.",
    img: "assets/img/fortune1.png"
  },
  {
    key: "fortune2",
    title: "중길",
    desc: "기대하지 않았던 기쁜 소식이 찾아옵니다.",
    img: "assets/img/fortune2.png"
  },
  {
    key: "fortune3",
    title: "소길",
    desc: "소소하지만 확실한 행복이 당신 곁에 머무릅니다.",
    img: "assets/img/fortune3.png"
  }
];

// 2) DOM 요소 가져오기
const drawBtn = document.getElementById("draw-btn");
const shareBtn = document.getElementById("share-btn");
const retryBtn = document.getElementById("retry-btn");

const drawSection = document.getElementById("draw-section");
const resultSection = document.getElementById("result-section");

const titleEl = document.getElementById("fortune-title");
const descEl = document.getElementById("fortune-desc");
const imgEl = document.getElementById("fortune-img");

// 3) URL 파라미터 처리 (공유 링크로 들어온 경우)
const urlParams = new URLSearchParams(window.location.search);
const referralKey = urlParams.get("f");

if (referralKey) {
  const matched = fortunes.find(f => f.key === referralKey);
  if (matched) {
    showResult(matched);

    // GA4: 공유 링크를 통해 들어온 방문
    if (typeof gtag === "function") {
      gtag("event", "referral_visit", {
        fortune_key: referralKey
      });
    }
  }
}

// 4) 복주머니(뽑기) 버튼 클릭 → 랜덤 결과 표시
drawBtn.addEventListener("click", () => {
  const selected = fortunes[Math.floor(Math.random() * fortunes.length)];
  showResult(selected);

  // GA4: 오미쿠지 뽑기 클릭 이벤트
  if (typeof gtag === "function") {
    gtag("event", "draw_click", {
      fortune_key: selected.key
    });
  }
});

// 5) 다시 뽑기 → 랜딩(복주머니 화면)으로 돌아가기
retryBtn.addEventListener("click", () => {
  // 쿼리 파라미터까지 완전히 초기화
  window.location.href = window.location.pathname;
});

// 6) 공유 버튼 클릭 → Web Share API + URL 파라미터
shareBtn.addEventListener("click", async () => {
  const fortuneKey = shareBtn.dataset.key;
  const shareUrl = `${window.location.origin}${window.location.pathname}?f=${fortuneKey}`;

  // GA4: 공유 버튼 클릭
  if (typeof gtag === "function") {
    gtag("event", "share_click", {
      fortune_key: fortuneKey
    });
  }

  // Web Share API 지원 시
  if (navigator.share) {
    try {
      await navigator.share({
        title: "오늘의 오미쿠지",
        text: "내가 뽑은 복주머니 운세를 확인해보세요!",
        url: shareUrl
      });
    } catch (err) {
      console.log("공유 취소 또는 오류", err);
    }
  } else {
    // Web Share API 미지원 브라우저용 Fallback
    window.prompt("아래 링크를 복사해서 친구에게 보내주세요.", shareUrl);
  }
});

// 7) 공통: 결과 화면 렌더링
function showResult(data) {
  drawSection.classList.add("hidden");
  resultSection.classList.remove("hidden");

  titleEl.textContent = data.title;
  descEl.textContent = data.desc;
  imgEl.src = data.img;
  imgEl.alt = `${data.title} 오미쿠지 이미지`;

  // 공유 시 어떤 운세였는지 알 수 있도록 key 저장
  shareBtn.dataset.key = data.key;
}
