// 1) 운세 데이터 정의
// weight 값으로 확률 조정 (합이 100일 필요는 없고 비율만 맞으면 됩니다)
const fortunes = [
  {
    key: "fortune1",
    title: "대길",
    desc: "오늘은 모든 일이 술술 풀리는 날! 새로운 시도를 해보세요.",
    img: "assets/img/fortune1.png",
    weight: 20   
  },
  {
    key: "fortune2",
    title: "중길",
    desc: "기대하지 않았던 기쁜 소식이 찾아옵니다.",
    img: "assets/img/fortune2.png",
    weight: 50   
  },
  {
    key: "fortune3",
    title: "소길",
    desc: "소소하지만 확실한 행복이 당신 곁에 머무릅니다.",
    img: "assets/img/fortune3.png",
    weight: 20   
  },
  
  {
    key: "fortune4",
    title: "말길",
    desc: "소소하지만 확실한 행복이 당신 곁에 머무릅니다.",
    img: "assets/img/fortune4.png",
    weight: 5
  },
  {
    key: "fortune5",
    title: "흉?",
    desc: "역전의 용사가 되어보세요. ",
    img: "assets/img/fortune4.png",
    weight: 5   
  }
];

// 현재 표시 중인 운세를 저장 (다운로드/공유용)
let currentFortune = null;

// 2) DOM 요소 가져오기
const drawBtn = document.getElementById("draw-btn");
const shareBtn = document.getElementById("share-btn");
const retryBtn = document.getElementById("retry-btn");
const downloadBtn = document.getElementById("download-btn");

const drawSection = document.getElementById("draw-section");
const loadingSection = document.getElementById("loading-section");
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
    currentFortune = matched;
    showResult(matched);

    // GA4: 공유 링크를 통해 들어온 방문
    if (typeof gtag === "function") {
      gtag("event", "referral_visit", {
        fortune_key: referralKey
      });
    }
  }
}

// 4) 가중치 기반 랜덤 선택 함수
function pickFortuneWeighted() {
  const totalWeight = fortunes.reduce(
    (sum, f) => sum + (typeof f.weight === "number" ? f.weight : 1),
    0
  );
  let r = Math.random() * totalWeight;

  for (const f of fortunes) {
    const w = typeof f.weight === "number" ? f.weight : 1;
    if (r < w) {
      return f;
    }
    r -= w;
  }
  return fortunes[fortunes.length - 1];
}

// 5) 복주머니(뽑기) 버튼 클릭 → 로딩 → 결과 표시
drawBtn.addEventListener("click", () => {
  // 로딩 화면 표시
  drawSection.classList.add("hidden");
  resultSection.classList.add("hidden");
  loadingSection.classList.remove("hidden");

  // 약간의 지연 후 결과 표시 (디자인 나오면 시간 조정 가능)
  setTimeout(() => {
    const selected = pickFortuneWeighted();
    currentFortune = selected;
    showResult(selected);

    // GA4: 오미쿠지 뽑기 클릭 이벤트
    if (typeof gtag === "function") {
      gtag("event", "draw_click", {
        fortune_key: selected.key
      });
    }
  }, 1200); // 1.2초 정도 대기
});

// 6) 다시 뽑기 → 랜딩(복주머니 화면)으로 돌아가기
retryBtn.addEventListener("click", () => {
  // 쿼리 파라미터까지 완전히 초기화
  window.location.href = window.location.pathname;
});

// 7) 공유 버튼 클릭 → Web Share API + URL 파라미터
shareBtn.addEventListener("click", async () => {
  if (!currentFortune) return;

  const fortuneKey = currentFortune.key;
  const shareUrl = `${window.location.origin}${window.location.pathname}?f=${fortuneKey}`;

  // GA4: 공유 버튼 클릭
  if (typeof gtag === "function") {
    gtag("event", "share_click", {
      fortune_key: fortuneKey
    });
  }

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
    window.prompt("아래 링크를 복사해서 친구에게 보내주세요.", shareUrl);
  }
});

// 8) 이미지 다운로드 버튼
downloadBtn.addEventListener("click", () => {
  if (!currentFortune) return;

  const link = document.createElement("a");
  link.href = currentFortune.img;

  // 확장자는 파일명에서 그대로 사용
  const parts = currentFortune.img.split("/");
  const fileName = parts[parts.length - 1] || `${currentFortune.key}.png`;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// 9) 공통: 결과 화면 렌더링
function showResult(data) {
  loadingSection.classList.add("hidden");
  drawSection.classList.add("hidden");
  resultSection.classList.remove("hidden");

  titleEl.textContent = data.title;
  descEl.textContent = data.desc;
  imgEl.src = data.img;
  imgEl.alt = `${data.title} 오미쿠지 이미지`;

  // 공유 시 어떤 운세였는지 알 수 있도록 key 저장
  shareBtn.dataset.key = data.key;
}
