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
              <h3>주요 발견사항</h3>
              <ul>
                <li>웹툰에서 가장 빈번하게 나타나는 감정 태그</li>
                <li>감정 태그 간의 연결 패턴</li>
                <li>장르별 감정적 특성의 차이</li>
              </ul>
              
              <h3>통계적 분석</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{webtoonData.length}</span>
                  <span className="stat-label">웹툰 태그 연결 수</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{emotionData.length}</span>
                  <span className="stat-label">이미지 감정 연결 수</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {new Set([...webtoonData.map(d => d.Source1), ...webtoonData.map(d => d.Source2)]).size}
                  </span>
                  <span className="stat-label">웹툰 태그 노드 수</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {new Set([...emotionData.map(d => d.Source1), ...emotionData.map(d => d.Source2)]).size}
                  </span>
                  <span className="stat-label">이미지 감정 노드 수</span>
                </div>
              </div>
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
