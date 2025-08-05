import React, { useState, useEffect } from 'react'
import './App.css'
import NetworkGraph from './components/NetworkGraph'
import ErrorBoundary from './components/ErrorBoundary'
import { loadCSVData } from './utils/dataLoader'

function App() {
  const [webtoonData, setWebtoonData] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState('both'); // 'both', 'webtoon', 'emotion'
  const [isLoading, setIsLoading] = useState(true);
  const [showWebtoonClusters, setShowWebtoonClusters] = useState(false);
  const [showEmotionClusters, setShowEmotionClusters] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleCarouselNext = () => {
    setCurrentSlide((prev) => (prev + 1) % 2);
  };

  const handleCarouselPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + 2) % 2);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [webtoon, emotion] = await Promise.all([
          loadCSVData('/data/webtoon_tag_jaccard_edges_Top15_weight2.csv'),
          loadCSVData('/data/image_emotion_jaccard_edges_Top15_weight55plus.csv')
        ]);
        setWebtoonData(webtoon);
        setEmotionData(emotion);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="camp-info">
            <h3 className="camp-title">2025 시흥 이공계 창의융합 진로캠프</h3>
            <p className="professor-info">유연주 교수님 팀</p>
          </div>
          <h1 className="title">네이버 웹툰 이미지 감정 태그 네트워크 분석</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="container">
          
          {/* 서론 */}
          <section className="section">
            <h2 className="section-title">서론</h2>
            <div className="content">
              <p>
                이 연구는 웹툰 표지에 사용된 색상이 독자의 감정에 어떤 영향을 미치는지 분석하고, 
                색상이 웹툰의 장르와 감정 표현에 어떻게 연결되는지를 살펴보는 것을 목표로 한다. 
                웹툰은 청소년들 사이에서 인기 있는 시각 중심의 콘텐츠로, 표지 이미지는 독자에게 
                작품의 분위기와 정서를 직관적으로 전달하며, 이는 작품 선택에 큰 영향을 미친다.
              </p>
              <p>
                특히 웹툰의 표지 색상은 독자가 스토리를 읽기 전부터 작품에 대한 감정적 반응을 유도하며, 
                감정 표현과 이미지의 연결은 독자에게 강력한 첫인상을 남긴다. 연구는 색채를 통해 전달되는 
                감정적 인상이 작품의 장르적 특성과 어떻게 맞물리는지에 주목한다.
              </p>
              <p>
                본 연구는 이미지 속 색상이 인간의 감정에 미치는 영향, 특히 색채가 시각적 경험과 감정적 반응을 어떻게 연결하는지를 탐구하고자 하였다. 이를 위해 웹툰 표지 이미지와 장르 태그를 수집하여 색상 경향을 분석하고, 감정 표현을 벡터로 수치화하였다. 이후 수집한 웹툰 태그와 이미지 감정을 자카드 유사도로 계산하여 태그·감정 이미지 네트워크를 구축하고, 색상·이미지·감정 간 상호작용을 시각화하였다.
              </p>
              <p>
                이를 통해 우리는 특정 웹툰이 왜 더 주목을 받는지, 또는 유사한 감정을 주는 작품들이 
                어떤 특성을 공유하는지 이해할 수 있다. 색상과 이미지, 감정은 웹툰의 몰입도와 메시지 전달에 
                중요한 역할을 하며, 이 연구는 향후 웹툰 기획과 시각적 마케팅 전략에 중요한 시사점을 제공할 것이다.
              </p>
            </div>
          </section>

          {/* 연구 방법 */}
          <section className="section">
            <h2 className="section-title">연구 방법</h2>
            <div className="content">
              <h3>웹툰 데이터 수집</h3>
              <p>
                네이버 웹툰에서 요일별 인기 웹툰을 대상으로 제목, 썸네일 이미지, 작가명, 태그 정보를 수집하였다. 
                이 과정은 웹 스크래핑 기법을 활용하여 자동화하였으며, 수집된 데이터는 후속 분석에 활용되었다.
              </p>
              
              <h3>태그 기반 유사도 분석</h3>
              <p>
                각 웹툰에 포함된 태그를 기준으로 웹툰 간 자카드 유사도를 계산하였다. 
                이후 태그 유사도가 0.2 미만인 경우는 의미 있는 연관성이 낮다고 판단하여 분석 대상에서 제외하였다.
              </p>
              
              <h3>이미지 기반 감정 분석</h3>
              <p>
                웹툰의 썸네일 이미지를 활용하여 주요 색상을 추출하고, 이를 사전에 정의된 감정 벡터에 매핑함으로써 
                각 웹툰의 감정 벡터를 생성하였다. 이 감정 벡터를 바탕으로 웹툰 간 자카드 유사도를 계산하였으며, 
                유사도가 0.55 미만인 경우는 분석에서 제외하였다.
              </p>
              <p>
                썸네일 이미지 기반 감정 벡터 생성 과정에서는 각 웹툰의 썸네일 이미지로부터 주요 색상을 추출하고, 
                이 색상들을 사전에 정의된 색상–감정 매핑표에 따라 감정 벡터로 변환하였다. 
                이미지에서 일정 기준(밝기, 채도, 명도, 회색 여부 등)을 만족하는 대표 색상을 상위 5개까지 추출하였으며, 
                각 색상의 비율을 바탕으로 감정 가중치를 계산하였다. 이후 감정별 가중 평균을 통해 최종 감정 벡터를 생성하고, 
                이를 통해 웹툰 간 감정 유사도를 산출하였다.
              </p>
              
              <h3>관계망 시각화</h3>
              <p>
                태그 기반 유사도와 감정 기반 유사도를 바탕으로 각각의 관계망을 구성하였고, 
                이를 Graphology와 Sigma.js 라이브러리를 이용하여 시각화하였다. 
                각 노드는 웹툰을, 엣지는 유사한 관계를 나타내도록 표현하였다.
              </p>
              
              <h3>집단 구조 분석</h3>
              <p>
                관계망 내에서 Louvain 알고리즘을 적용하여 웹툰 간 유사성에 따라 형성되는 집단(community)을 분석하였다. 
                이를 통해 어떤 웹툰들이 서로 유사한 속성이나 감정을 공유하는지를 확인할 수 있었다.
              </p>
            </div>
          </section>

          {/* 그래프 영역 */}
          <section className="section">
            <h2 className="section-title">네트워크 그래프</h2>
            <div className="graph-container">
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>데이터를 로딩 중입니다...</p>
                </div>
              ) : (
                <div className="graph-controls-container">
                  <div className="graph-toggle">
                    <button 
                      className={`btn ${selectedGraph === 'both' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSelectedGraph('both')}
                    >
                      두 그래프 모두 보기
                    </button>
                    <button 
                      className={`btn ${selectedGraph === 'webtoon' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSelectedGraph('webtoon')}
                    >
                      웹툰 태그 네트워크
                    </button>
                    <button 
                      className={`btn ${selectedGraph === 'emotion' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSelectedGraph('emotion')}
                    >
                      이미지 감정 네트워크
                    </button>
                  </div>
                  
                  {/* 집단 찾기 버튼들 */}
                  <div className="cluster-controls">
                    {selectedGraph === 'both' && (
                      <>
                        <button 
                          className={`btn ${showWebtoonClusters ? 'btn-success' : 'btn-outline'}`}
                          onClick={() => setShowWebtoonClusters(!showWebtoonClusters)}
                        >
                          {showWebtoonClusters ? '웹툰 집단 숨기기' : '웹툰 집단 찾기'}
                        </button>
                        <button 
                          className={`btn ${showEmotionClusters ? 'btn-success' : 'btn-outline'}`}
                          onClick={() => setShowEmotionClusters(!showEmotionClusters)}
                        >
                          {showEmotionClusters ? '감정 집단 숨기기' : '감정 집단 찾기'}
                        </button>
                      </>
                    )}
                    {selectedGraph === 'webtoon' && (
                      <button 
                        className={`btn ${showWebtoonClusters ? 'btn-success' : 'btn-outline'}`}
                        onClick={() => setShowWebtoonClusters(!showWebtoonClusters)}
                      >
                        {showWebtoonClusters ? '집단 숨기기' : '집단 찾기'}
                      </button>
                    )}
                    {selectedGraph === 'emotion' && (
                      <button 
                        className={`btn ${showEmotionClusters ? 'btn-success' : 'btn-outline'}`}
                        onClick={() => setShowEmotionClusters(!showEmotionClusters)}
                      >
                        {showEmotionClusters ? '집단 숨기기' : '집단 찾기'}
                      </button>
                    )}
                  </div>
                  
                  <div className="graphs-display">
                    {selectedGraph === 'both' && (
                      <div className="both-graphs">
                        <ErrorBoundary>
                          <NetworkGraph 
                            data={webtoonData} 
                            title="웹툰 태그 네트워크 (Jaccard 유사도)"
                            height={400}
                            showClusters={showWebtoonClusters}
                            onClustersFound={(clusters) => console.log('웹툰 집단:', clusters)}
                          />
                        </ErrorBoundary>
                        <ErrorBoundary>
                          <NetworkGraph 
                            data={emotionData} 
                            title="이미지 감정 네트워크 (Jaccard 유사도)"
                            height={400}
                            showClusters={showEmotionClusters}
                            onClustersFound={(clusters) => console.log('감정 집단:', clusters)}
                          />
                        </ErrorBoundary>
                      </div>
                    )}
                    {selectedGraph === 'webtoon' && (
                      <ErrorBoundary>
                        <NetworkGraph 
                          data={webtoonData} 
                          title="웹툰 태그 네트워크 (Jaccard 유사도)"
                          height={600}
                          showClusters={showWebtoonClusters}
                          onClustersFound={(clusters) => console.log('웹툰 집단:', clusters)}
                        />
                      </ErrorBoundary>
                    )}
                    {selectedGraph === 'emotion' && (
                      <ErrorBoundary>
                        <NetworkGraph 
                          data={emotionData} 
                          title="이미지 감정 네트워크 (Jaccard 유사도)"
                          height={600}
                          showClusters={showEmotionClusters}
                          onClustersFound={(clusters) => console.log('감정 집단:', clusters)}
                        />
                      </ErrorBoundary>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 연구 결과 */}
          <section className="section">
            <h2 className="section-title">연구 결과</h2>
            <div className="content">
              <h3>등장 태그 빈도수 Top 10</h3>
              <div className="top-tags-container">
                <div className="carousel-container">
                  <button className="carousel-btn prev-btn" onClick={() => handleCarouselPrev()}>
                    <span>‹</span>
                  </button>
                  
                  <div className="carousel-wrapper">
                    <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                      <div className="carousel-slide">
                        <div className="slide-content">
                          <div className="tags-row">
                            <div className="carousel-tag-card">
                              <div className="rank-badge">1</div>
                              <div className="tag-info">
                                <div className="carousel-tag-name">소설원작</div>
                                <div className="tag-count">44회</div>
                              </div>
                            </div>
                            <div className="carousel-tag-card">
                              <div className="rank-badge">2</div>
                              <div className="tag-info">
                                <div className="carousel-tag-name">먼치킨</div>
                                <div className="tag-count">32회</div>
                              </div>
                            </div>
                            <div className="carousel-tag-card">
                              <div className="rank-badge">3</div>
                              <div className="tag-info">
                                <div className="carousel-tag-name">액션</div>
                                <div className="tag-count">30회</div>
                              </div>
                            </div>
                            <div className="carousel-tag-card">
                              <div className="rank-badge">4</div>
                              <div className="tag-info">
                                <div className="carousel-tag-name">판타지</div>
                                <div className="tag-count">29회</div>
                              </div>
                            </div>
                            <div className="carousel-tag-card">
                              <div className="rank-badge">5</div>
                              <div className="tag-info">
                                <div className="carousel-tag-name">무협/사극</div>
                                <div className="tag-count">24회</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="carousel-slide">
                        <div className="slide-content">
                          <div className="tags-row">
                            <div className="carousel-tag-card">
                              <div className="rank-badge">6</div>
                              <div className="tag-info">
                                <div className="carousel-tag-name">드라마</div>
                                <div className="tag-count">23회</div>
                              </div>
                            </div>
                            <div className="carousel-tag-card">
                              <div className="rank-badge">7</div>
                              <div className="tag-info">
                                <div className="carousel-tag-name">사이다</div>
                                <div className="tag-count">18회</div>
                              </div>
                            </div>
                            <div className="carousel-tag-card">
                              <div className="rank-badge">8</div>
                              <div className="tag-info">
                                <div className="carousel-tag-name">자극적인</div>
                                <div className="tag-count">17회</div>
                              </div>
                            </div>
                            <div className="carousel-tag-card">
                              <div className="rank-badge">8</div>
                              <div className="tag-info">
                                <div className="carousel-tag-name">복수극</div>
                                <div className="tag-count">17회</div>
                              </div>
                            </div>
                            <div className="carousel-tag-card">
                              <div className="rank-badge">10</div>
                              <div className="tag-info">
                                <div className="carousel-tag-name">로맨스</div>
                                <div className="tag-count">16회</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="carousel-btn next-btn" onClick={() => handleCarouselNext()}>
                    <span>›</span>
                  </button>
                </div>
                
                <div className="carousel-dots">
                  <button 
                    className={`dot ${currentSlide === 0 ? 'active' : ''}`} 
                    onClick={() => setCurrentSlide(0)}
                  ></button>
                  <button 
                    className={`dot ${currentSlide === 1 ? 'active' : ''}`} 
                    onClick={() => setCurrentSlide(1)}
                  ></button>
                </div>
              </div>
              
              <h3>웹툰 태그 네트워크 분석 결과</h3>
              <p>
                웹툰 태그 네트워크 분석 결과, 각 집단(community)에서는 뚜렷한 주제적 공통점이 나타났다.
              </p>
              
              <div className="community-analysis">
                <p className="community-paragraph">
                  집단 1에서는 '<span className="highlight">#자극적인</span>' 태그를 중심으로, 스릴러, 로맨스, 일상물 등 다양한 장르의 웹툰이 엮이는 양상을 보였다. 이는 자극적인 요소가 장르를 가리지 않고 여러 작품에서 독자들의 관심을 끌고 있음을 시사한다. 집단 2와 집단 3에서는 각각 '<span className="highlight">#액션, #사이다</span>', 그리고 '<span className="highlight">#무협/사극, #액션</span>' 태그가 주요하게 등장했다. 이는 액션성, 통쾌함, 무협적 요소가 뚜렷한 작품들이 하나의 그룹을 이루며, 유사한 독자 취향을 반영함을 보여준다. 집단 4는 '<span className="highlight">#판타지</span>' 태그가 중심이며, 다수의 작품이 '<span className="highlight">#소설원작</span>'임이 특징적이었다. 이는 소설을 기반으로 한 판타지물이 하나의 거대한 네트워크를 형성하고 있음을 의미한다. 집단 5는 '<span className="highlight">#액션+판타지</span>'의 융합 장르가 주를 이루었고, 집단 6에서는 '<span className="highlight">#일상물, #힐링, #개그, #공감</span>'과 같이 가볍고 따뜻한 분위기의 작품들이 모여 있어, 감정적 친근감이나 위로를 제공하는 특성이 두드러졌다. 한편, 집단 7은 '<span className="highlight">#드라마, #직업드라마</span>' 중심, 집단 8은 '<span className="highlight">#로맨스</span>'가 주된 공통점으로 나타나 각 집단별로 뚜렷한 장르적 색채가 드러났다.
                </p>
              </div>
              
              <h3>이미지 감정 네트워크 분석 결과</h3>
              <p>
                웹툰 표지의 감정 이미지 네트워크 분석에서도 각 집단마다 뚜렷한 분위기가 확인되었다.
              </p>
              
              <div className="emotion-analysis">
                <p className="emotion-paragraph">
                  집단 1은 인물들의 지루하거나 무표정한 표정이 반복적으로 등장해, 정적이거나 무미건조한 분위기가 특징이었다. 집단 2와 집단 3에서는 '권위(authority)', '아우라', '미스터리', '판타지'와 같은 요소가 강하게 나타났으나, 일부 작품에서는 강렬한 위협이나 불안(공포, 살인예고 등)이 묘사되기도 했다. 집단 4는 전체적으로 긍정적이고 안정적이며, 온화한 감성이 두드러졌다. 극단적으로 격렬하거나 부정적인 감정보다는 균형 잡힌, 따뜻한 감정이 강조되어 있었다. 집단 5에서는 '공포' 감정이 집약적으로 나타났다. 마지막으로 집단 6은 파란색 배경에 인물을 강조하는 디자인이 반복되어, 색채와 레이아웃 모두에서 일관된 시각적 경향성을 확인할 수 있었다.
                </p>
              </div>
              
              <h3>태그 출현 빈도 분석</h3>
              <p>
                태그 출현 빈도 분석 결과, 상위 10개 태그는 '<span className="highlight">#소설원작</span>', '<span className="highlight">#먼치킨</span>', '<span className="highlight">#액션</span>', '<span className="highlight">#판타지</span>', '<span className="highlight">#무협/사극</span>', '<span className="highlight">#드라마</span>', '<span className="highlight">#사이다</span>', '<span className="highlight">#자극적인</span>', '<span className="highlight">#복수극</span>', '<span className="highlight">#로맨스</span>' 순으로 나타났다.
              </p>
                              <p>
                  특히 '<span className="highlight">#소설원작</span>'은 44회로 압도적으로 많이 등장했으며, 이는 완성도와 신뢰성, 결말에 대한 기대감 등 독자의 긍정적 기대 심리가 반영된 결과로 볼 수 있다. '<span className="highlight">#먼치킨</span>', '<span className="highlight">#액션</span>', '<span className="highlight">#판타지</span>', '<span className="highlight">#사이다</span>', '<span className="highlight">#복수극</span>' 등도 대리만족, 극적인 전개, 강렬한 감정 유발을 통해 웹툰의 흥미 요소를 극대화하는 공통점이 있다.
                </p>
              
              <h3>종합 분석 및 시사점</h3>
              <p>
                이상의 결과는 웹툰이 단순히 장르별로만 분류되지 않으며, 태그 및 표지 감정 네트워크를 통해 다층적인 공통점과 특성이 드러남을 시사한다. 특정 장르와 감정이 교차하는 집단, 그리고 반복적으로 등장하는 색채와 태그가 독자들에게 강한 인상과 선호를 불러일으키고 있음을 확인할 수 있었다.
              </p>
              <p>
                이러한 분석은 향후 웹툰 기획, 시각적 마케팅, 그리고 독자 타깃팅 전략 수립에 실질적인 시사점을 제공한다.
              </p>
            </div>
          </section>

          {/* 결론 */}
          <section className="section">
            <h2 className="section-title">결론</h2>
            <div className="content">
              <p>
                본 연구를 통해 네이버 웹툰의 이미지에서 나타나는 감정적 특성을 
                네트워크 분석으로 시각화하고 분석할 수 있었습니다.
              </p>
              <p>
                향후 연구에서는 더 많은 웹툰 데이터를 수집하여 
                더 정확한 패턴 분석을 진행할 예정입니다.
              </p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="researcher-info">
              <p><strong>학생:</strong> 김도영, 김시은, 김지유, 배예슬, 정다연(은행고등학교)</p>
              <p><strong>지도:</strong> 유연주, 왕효원(서울대학교 수학교육과)</p>
            </div>
            <div className="footer-links">
              <p>&copy; 2025 시흥 이공계 창의융합 진로캠프</p>
              <p>네이버 웹툰 이미지 감정 분석 프로젝트</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
