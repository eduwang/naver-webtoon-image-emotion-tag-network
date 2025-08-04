import React, { useEffect, useRef, useState } from 'react';
import Sigma from 'sigma';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import circular from 'graphology-layout/circular';
import louvain from 'graphology-communities-louvain';
import iwanthue from 'iwanthue';

const NetworkGraph = ({ data, title, height = 500, showClusters = false, onClustersFound }) => {
  const containerRef = useRef(null);
  const sigmaRef = useRef(null);
  const [webtoonData, setWebtoonData] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [clusterColors, setClusterColors] = useState({}); // 노드별 집단 색상 저장

  // CSV 파싱 함수 (따옴표 처리)
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  // 노드 이름 정규화 함수
  const normalizeNodeName = (nodeName) => {
    // 앞부분 제거 (예: "tue_12_title" -> "title")
    let normalized = nodeName.replace(/^[a-z]{3}_\d+_/, '');
    // .jpg 확장자 제거
    normalized = normalized.replace(/\.jpg$/, '');
    // 앞뒤 공백 제거
    normalized = normalized.trim();
    
    // 특수문자 보존: 콜론, 점, 공백 등은 그대로 유지
    // "캐슬2:만인지상" -> "캐슬2:만인지상"
    // "중증외상센터 : 외과의사 백강혁" -> "중증외상센터 : 외과의사 백강혁"
    // "퇴마록 : 세계편" -> "퇴마록 : 세계편"
    // "A.I. 닥터" -> "A.I. 닥터"
    
    return normalized;
  };

  // 집단 찾기 알고리즘 (Louvain 방법)
  const findClusters = (graph) => {
    // Louvain 알고리즘으로 커뮤니티 감지
    louvain.assign(graph, {
      resolution: 1,
      randomWalk: false
    });

    // 커뮤니티별로 노드 그룹화
    const communities = {};
    graph.forEachNode((node, attributes) => {
      const community = attributes.community;
      if (!communities[community]) {
        communities[community] = [];
      }
      communities[community].push(node);
    });

    // 커뮤니티를 배열로 변환 (단일 노드 제외)
    const clusters = Object.values(communities).filter(cluster => cluster.length > 1);
    
    return clusters;
  };

  // 색상을 투명하게 만드는 함수
  const makeColorTransparent = (color, alpha = 0.1) => {
    // hex 색상을 rgba로 변환
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // rgb 색상을 rgba로 변환
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    // 이미 rgba인 경우 alpha만 변경
    if (color.startsWith('rgba(')) {
      return color.replace(/[\d.]+\)$/, `${alpha})`);
    }
    // 기본값
    return `rgba(3, 199, 90, ${alpha})`;
  };

  // 집단별 색상 생성 (iwanthue 사용)
  const getClusterColors = (clusterCount) => {
    if (clusterCount <= 10) {
      // 10개 이하일 때는 미리 정의된 색상 사용
      const colors = [
        '#03c75a', // 네이버 그린
        '#ff6b6b', // 빨강
        '#4ecdc4', // 청록
        '#45b7d1', // 파랑
        '#96ceb4', // 연두
        '#feca57', // 노랑
        '#ff9ff3', // 분홍
        '#54a0ff', // 하늘색
        '#5f27cd', // 보라
        '#00d2d3', // 청록
      ];
      return colors.slice(0, clusterCount);
    } else {
      // 10개 이상일 때는 iwanthue로 색상 생성
      return iwanthue(clusterCount, {
        clustering: 'force-vector',
        seed: 42,
        quality: 'best'
      });
    }
  };

  // 웹툰 데이터 로드
  useEffect(() => {
    const loadWebtoonData = async () => {
      try {
        const response = await fetch('/data/naver_webtoon_top15_by_day_no_duplicates.csv');
        const csvText = await response.text();
        
        // CSV 파싱 (따옴표 처리)
        const lines = csvText.split('\n');
        const webtoonMap = {};
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = parseCSVLine(lines[i]);
            const title = values[2]?.replace(/"/g, '').trim(); // 따옴표 제거 및 공백 제거
            const thumbnail = values[3]?.replace(/"/g, '').trim();
            
            if (title && thumbnail) {
              webtoonMap[title] = thumbnail;
              console.log('웹툰 데이터 로드:', { 
                원본제목: values[2], 
                정리된제목: title, 
                썸네일: thumbnail 
              });
            }
          }
        }
        
        setWebtoonData(webtoonMap);
      } catch (error) {
        console.error('웹툰 데이터 로드 실패:', error);
      }
    };

    loadWebtoonData();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0 || !webtoonData) return;

    // 기존 Sigma 인스턴스 정리
    if (sigmaRef.current) {
      sigmaRef.current.kill();
    }

    const container = containerRef.current;
    
    // 컨테이너 크기 명시적 설정
    container.style.width = '100%';
    container.style.height = `${height}px`;
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.minHeight = `${height}px`;
    container.style.display = 'block';
    container.style.boxSizing = 'border-box';
    container.style.flex = '1';
    container.style.minWidth = '0';
    container.style.minHeight = '0';
    
    // Canvas 위치 조정을 위한 설정
    container.style.transform = 'translateZ(0)';
    
    // 강제로 크기 설정 (CSS 우선순위)
    container.setAttribute('style', container.getAttribute('style') + `; height: ${height}px !important; min-height: ${height}px !important;`);

    // 컨테이너가 실제로 렌더링될 때까지 대기
    const initializeSigma = () => {
      // 컨테이너 크기 확인
      if (container.offsetWidth === 0 || container.offsetHeight === 0 || container.offsetHeight === 1) {
        console.log('컨테이너 크기가 0 또는 1입니다. 강제 설정 시도...');
        // 강제로 크기 설정
        container.style.width = '100%';
        container.style.height = `${height}px`;
        container.style.minHeight = `${height}px`;
        
        // 설정 후 실제 크기 확인
        setTimeout(() => {
          if (container.offsetWidth > 0 && container.offsetHeight > 1) {
            console.log('컨테이너 크기 설정 성공:', container.offsetWidth, 'x', container.offsetHeight);
            initializeSigma();
          } else {
            console.log('컨테이너 크기 설정 실패, 기본값으로 진행');
            // 무한 루프 방지를 위해 기본값으로 진행
            initializeSigma();
          }
        }, 50);
        return;
      }

      console.log('컨테이너 크기:', container.offsetWidth, 'x', container.offsetHeight);
      
      // 컨테이너 크기가 여전히 문제가 있으면 강제로 설정
      if (container.offsetHeight <= 1) {
        container.style.height = `${height}px`;
        container.style.minHeight = `${height}px`;
        console.log('컨테이너 높이 강제 설정:', height, 'px');
      }

      // 그래프 생성
      const graph = new Graph();

      // 노드와 엣지 데이터 파싱
      const nodes = new Set();
      const edges = new Set();

      data.forEach(row => {
        const source = row.Source1?.trim();
        const target = row.Source2?.trim();
        const weight = parseFloat(row.Weight);

        if (source && target && source !== target) {
          nodes.add(source);
          nodes.add(target);
          const edgeKey = `${source}-${target}`;
          const reverseEdgeKey = `${target}-${source}`;
          
          if (!edges.has(edgeKey) && !edges.has(reverseEdgeKey)) {
            edges.add(edgeKey);
            edges.add({ source, target, weight });
          }
        }
      });

      const nodeArray = Array.from(nodes);
      const edgeArray = Array.from(edges).filter(edge => typeof edge === 'object');

      // 노드 추가
      nodeArray.forEach(nodeId => {
        const normalizedLabel = normalizeNodeName(nodeId);
        graph.addNode(nodeId, {
          label: normalizedLabel,
          size: 6,
          color: '#03c75a',
          labelColor: '#000000',
          labelSize: 12
        });
      });

      // 엣지 추가
      edgeArray.forEach(({ source, target, weight }) => {
        try {
          graph.addEdge(source, target, {
            size: Math.min(weight / 3, 3),
            color: '#666',
            weight: weight
          });
        } catch (error) {
          console.warn(`엣지 추가 실패: ${source} -> ${target}`, error);
        }
      });

      // 기존 방식: 원형 레이아웃 후 Force Atlas 2 실행
      circular.assign(graph);
      forceAtlas2.assign(graph, { iterations: 500 });

      // 중심성 기반 노드 크기 조정
      const degrees = graph.nodes().map((node) => graph.degree(node));
      const minDegree = Math.min(...degrees);
      const maxDegree = Math.max(...degrees);
      const minSize = 3, maxSize = 9; // 최대 크기를 15에서 9로 줄임 (60%)
      
      // 원래 크기 정보 저장
      const originalSizes = {};
      
      graph.forEachNode((node) => {
        const degree = graph.degree(node);
        const originalSize = minSize + ((degree - minDegree) / (maxDegree - minDegree)) * (maxSize - minSize);
        originalSizes[node] = originalSize;
        graph.setNodeAttribute(node, "size", originalSize);
      });

      // 가중치 기반 엣지 두께 조정
      const weights = edgeArray.map(edge => edge.weight);
      const minWeight = Math.min(...weights);
      const maxWeight = Math.max(...weights);
      
      graph.forEachEdge((edge, attributes, source, target) => {
        const weight = attributes.weight;
        const normalizedWeight = (weight - minWeight) / (maxWeight - minWeight);
        const edgeSize = 1 + (normalizedWeight * 2); // 최소 1, 최대 3 (기존 5에서 줄임)
        graph.setEdgeAttribute(edge, 'size', edgeSize);
      });

      // 집단 찾기 및 색상 적용
      if (showClusters) {
        const foundClusters = findClusters(graph);
        setClusters(foundClusters);
        
        if (onClustersFound) {
          onClustersFound(foundClusters);
        }
        
        // 집단별 색상 생성
        const colors = getClusterColors(foundClusters.length);
        
        // 노드별 집단 색상 저장
        const nodeClusterColors = {};
        
        // 각 집단별로 색상 적용
        foundClusters.forEach((cluster, clusterIndex) => {
          const color = colors[clusterIndex];
          cluster.forEach(nodeId => {
            graph.setNodeAttribute(nodeId, 'color', color);
            // 그래프 노드에 집단 색상 정보를 직접 저장
            graph.setNodeAttribute(nodeId, 'clusterColor', color);
            nodeClusterColors[nodeId] = color; // 색상 정보 저장
            console.log(`집단 ${clusterIndex + 1} 노드 ${nodeId} 색상 저장: ${color}`);
          });
        });
        
        setClusterColors(nodeClusterColors);
        console.log('Louvain 집단 찾기 완료:', foundClusters.length, '개 집단');
        console.log('저장된 집단 색상:', nodeClusterColors);
      } else {
        // 집단 표시 비활성화 시 원래 색상으로 복원
        graph.forEachNode((nodeId) => {
          graph.setNodeAttribute(nodeId, 'color', '#03c75a');
          // 그래프에서 집단 색상 정보 제거
          graph.removeNodeAttribute(nodeId, 'clusterColor');
        });
        setClusters([]);
        setClusterColors({});
      }

      // Sigma 초기화 (v2 호환)
      const sigma = new Sigma(graph, container, {
        labelFont: "Arial",
        labelWeight: "bold",
        defaultNodeLabelSize: 50,
        allowInvalidContainer: true, // 컨테이너 크기 문제 무시
        enableEdgeHovering: true,
        enableNodeHovering: true,
        enableMouseWheel: true,
        enableCamera: true,
        minCameraRatio: 0.1,
        maxCameraRatio: 10,
        renderEdgeLabels: false, // 엣지 라벨 비활성화로 성능 향상
        labelSize: 'fixed',
        labelDensity: 1.0, // 모든 라벨 표시
        labelGridCellSize: 60,
        labelRenderedSizeThreshold: 0, // 모든 크기에서 라벨 표시
        labelColor: '#000000', // 라벨 색상을 검정으로 명시
        labelBackgroundColor: '#ffffff', // 라벨 배경색을 흰색으로 설정
        labelBackgroundOpacity: 0.8 // 라벨 배경 투명도
      });

      sigmaRef.current = sigma;

      // Sigma 초기화 후 리프레시 및 Canvas 위치 조정
      setTimeout(() => {
        if (sigmaRef.current) {
          sigmaRef.current.refresh();
          
          // Canvas 위치 강제 조정
          const canvases = container.querySelectorAll('canvas');
          canvases.forEach(canvas => {
            canvas.style.left = '0';
            canvas.style.top = '0';
            canvas.style.position = 'absolute';
          });
          
          // 라벨 렌더링 강제 활성화
          console.log('라벨 렌더링 상태 확인:', {
            노드수: graph.nodes().length,
            라벨설정: graph.nodes().map(node => ({
              노드: node,
              라벨: graph.getNodeAttribute(node, 'label'),
              색상: graph.getNodeAttribute(node, 'labelColor')
            }))
          });
          
          // 라벨 렌더링 강제 활성화 시도
          setTimeout(() => {
            if (sigmaRef.current) {
              sigmaRef.current.refresh();
              console.log('라벨 렌더링 강제 리프레시 완료');
            }
          }, 100);
        }
      }, 50);

      // 툴팁 생성
      const tooltip = document.createElement('div');
      tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 12px;
        border-radius: 8px;
        font-size: 12px;
        pointer-events: none;
        z-index: 1000;
        display: none;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      container.appendChild(tooltip);

      // 노드 호버 이벤트
      sigma.on('enterNode', (event) => {
        const node = event.node;
        const nodeData = graph.getNodeAttributes(node);
        
        // 노드 이름 정규화
        const nodeTitle = normalizeNodeName(node);
        
        // 1차: 정확한 매칭
        let thumbnail = webtoonData[nodeTitle];
        
        // 2차: 특수문자 제거 후 매칭 (콜론, 점, 공백 등)
        if (!thumbnail) {
          const normalizedTitle = nodeTitle
            .replace(/[:：]/g, '') // 콜론 제거
            .replace(/[.·]/g, '') // 점 제거
            .replace(/\s+/g, ' ') // 연속 공백을 하나로
            .trim();
          
          thumbnail = webtoonData[normalizedTitle];
          
          // 3차: 부분 매칭
          if (!thumbnail) {
            const partialMatch = Object.keys(webtoonData).find(key => 
              key.includes(normalizedTitle) || normalizedTitle.includes(key)
            );
            if (partialMatch) {
              thumbnail = webtoonData[partialMatch];
            }
          }
        }
        
        console.log('노드 호버:', {
          원본노드명: node,
          추출된제목: nodeTitle,
          썸네일URL: thumbnail,
          매칭여부: webtoonData.hasOwnProperty(nodeTitle),
          유사한제목들: Object.keys(webtoonData).filter(key => 
            key.includes(nodeTitle) || nodeTitle.includes(key)
          ).slice(0, 5), // 처음 5개만 표시
          정확한매칭: Object.keys(webtoonData).find(key => key === nodeTitle)
        });
        
        // 연결된 노드들 찾기
        const connectedNodes = new Set();
        connectedNodes.add(node);
        
        graph.forEachNeighbor(node, (neighbor) => {
          connectedNodes.add(neighbor);
        });
        
        // 모든 노드를 투명하게 만들고, 연결된 노드만 보이게 하기
        graph.forEachNode((nodeId) => {
          if (connectedNodes.has(nodeId)) {
            let nodeColor = '#03c75a';
            // 그래프에서 직접 집단 색상 정보를 가져옴
            const clusterColor = graph.getNodeAttribute(nodeId, 'clusterColor');
            if (showClusters && clusterColor) {
              nodeColor = clusterColor;
              console.log(`노드 ${nodeId} 집단 색상 적용: ${nodeColor}`);
            }
            graph.setNodeAttribute(nodeId, 'color', nodeColor);
            graph.setNodeAttribute(nodeId, 'size', originalSizes[nodeId]);
          } else {
            // 연결 안 된 노드는 투명하되, 집단 색상 정보가 있으면 그 색상의 투명 버전 사용
            const clusterColor = graph.getNodeAttribute(nodeId, 'clusterColor');
            if (showClusters && clusterColor) {
              // 색상을 투명하게 만들기 위해 rgba로 변환
              const transparentColor = makeColorTransparent(clusterColor, 0.1);
              graph.setNodeAttribute(nodeId, 'color', transparentColor);
            } else {
              graph.setNodeAttribute(nodeId, 'color', 'rgba(3, 199, 90, 0.1)');
            }
            graph.setNodeAttribute(nodeId, 'size', Math.max(originalSizes[nodeId] * 0.3, 1));
          }
        });
        
        // 모든 엣지를 투명하게 만들고, 연결된 엣지만 보이게 하기
        graph.forEachEdge((edge, attributes, source, target) => {
          if (connectedNodes.has(source) && connectedNodes.has(target)) {
            graph.setEdgeAttribute(edge, 'color', '#666');
            graph.setEdgeAttribute(edge, 'size', attributes.size);
          } else {
            graph.setEdgeAttribute(edge, 'color', 'rgba(102, 102, 102, 0.1)');
            graph.setEdgeAttribute(edge, 'size', Math.max(attributes.size * 0.3, 0.5));
          }
        });
        
        let tooltipContent = `
          <div style="margin-bottom: 8px;">
            <strong style="font-size: 14px;">${nodeTitle}</strong>
          </div>
          <div style="margin-bottom: 8px;">
            연결 수: ${graph.degree(node)}<br>
            중심성: ${(graph.degree(node) / (nodeArray.length - 1)).toFixed(3)}
          </div>
        `;
        
        if (thumbnail) {
          console.log('썸네일 이미지 로드 시도:', thumbnail);
          tooltipContent += `
            <div style="margin-top: 8px;">
              <img src="${thumbnail}" alt="${nodeTitle}" style="width: 100%; max-width: 150px; height: auto; border-radius: 4px;" onload="console.log('이미지 로드 성공:', '${thumbnail}')" onerror="console.log('이미지 로드 실패:', '${thumbnail}')" />
            </div>
          `;
        } else {
          console.log('썸네일을 찾을 수 없음:', nodeTitle);
        }
        
        tooltip.innerHTML = tooltipContent;
        tooltip.style.display = 'block';
        
        // Sigma v2의 getMouseCoords 사용 (가장 확실한 방법)
        let x = 0, y = 0;
        if (typeof sigma.getMouseCoords === 'function') {
          // Sigma v2 권장 방식
          const coords = sigma.getMouseCoords(event.event);
          x = coords.x + 15;
          y = coords.y - 200;
        } else if (event.event && event.event.clientX) {
          // Fallback (직접 계산)
          const rect = container.getBoundingClientRect();
          x = event.event.clientX - rect.left + 15;
          y = event.event.clientY - rect.top - 200;
        }
        
        // 툴팁이 화면 밖으로 나가지 않도록 조정
        const tooltipWidth = 300;
        const tooltipHeight = 250;
        
        let finalX = x;
        let finalY = y;
        
        // 오른쪽 경계 체크
        if (x + tooltipWidth > container.offsetWidth) {
          finalX = x - tooltipWidth - 30;
        }
        
        // 위쪽 경계 체크
        if (y < 0) {
          finalY = y + 250; // 툴팁을 아래로 이동
        }
        
        tooltip.style.left = finalX + 'px';
        tooltip.style.top = finalY + 'px';
      });

      sigma.on('leaveNode', () => {
        // 모든 노드와 엣지를 원래 상태로 복원
        graph.forEachNode((nodeId) => {
          let nodeColor = '#03c75a';
          // 그래프에서 직접 집단 색상 정보를 가져옴
          const clusterColor = graph.getNodeAttribute(nodeId, 'clusterColor');
          if (showClusters && clusterColor) {
            nodeColor = clusterColor;
            console.log(`노드 ${nodeId} 집단 색상 복원: ${nodeColor}`);
          }
          graph.setNodeAttribute(nodeId, 'color', nodeColor);
          graph.setNodeAttribute(nodeId, 'size', originalSizes[nodeId]);
        });
        
        graph.forEachEdge((edge, attributes, source, target) => {
          graph.setEdgeAttribute(edge, 'color', '#666');
          graph.setEdgeAttribute(edge, 'size', attributes.size);
        });
        
        tooltip.style.display = 'none';
      });

      sigma.on('mousemove', (event) => {
        if (tooltip.style.display === 'block') {
          // Sigma v2의 getMouseCoords 사용
          let x = 0, y = 0;
          if (typeof sigma.getMouseCoords === 'function') {
            // Sigma v2 권장 방식
            const coords = sigma.getMouseCoords(event.event);
            x = coords.x + 15;
            y = coords.y - 200;
          } else if (event.event && event.event.clientX) {
            // Fallback (직접 계산)
            const rect = container.getBoundingClientRect();
            x = event.event.clientX - rect.left + 15;
            y = event.event.clientY - rect.top - 200;
          }
          
          // 툴팁이 화면 밖으로 나가지 않도록 조정
          const tooltipWidth = 300;
          const tooltipHeight = 250;
          
          let finalX = x;
          let finalY = y;
          
          // 오른쪽 경계 체크
          if (x + tooltipWidth > container.offsetWidth) {
            finalX = x - tooltipWidth - 30;
          }
          
          // 위쪽 경계 체크
          if (y < 0) {
            finalY = y + 250; // 툴팁을 아래로 이동
          }
          
          tooltip.style.left = finalX + 'px';
          tooltip.style.top = finalY + 'px';
        }
      });

      // 엣지 호버 이벤트
      sigma.on('enterEdge', (event) => {
        const edge = event.edge;
        const edgeData = graph.getEdgeAttributes(edge);
        
        tooltip.innerHTML = `
          <strong>연결</strong><br>
          가중치: ${edgeData.weight.toFixed(3)}
        `;
        tooltip.style.display = 'block';
      });

      sigma.on('leaveEdge', () => {
        tooltip.style.display = 'none';
      });

      // ResizeObserver로 반응형 대응
      const resizeObserver = new ResizeObserver(() => {
        if (sigmaRef.current) {
          sigmaRef.current.refresh();
        }
      });
      resizeObserver.observe(container);

      console.log('Sigma + Force Atlas 2 초기화 완료:', {
        노드수: nodeArray.length,
        엣지수: edgeArray.length,
        컨테이너크기: `${container.offsetWidth}x${container.offsetHeight}`,
        최소중심성: minDegree,
        최대중심성: maxDegree,
        최소가중치: minWeight,
        최대가중치: maxWeight
      });
    };

    // 초기화 함수 호출
    initializeSigma();

    return () => {
      if (sigmaRef.current) {
        sigmaRef.current.kill();
      }
    };
  }, [data, height, webtoonData, showClusters]);

  return (
    <div className="network-graph-container">
      <h3 className="graph-title">{title}</h3>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: `${height}px`,
          minHeight: `${height}px`,
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          backgroundColor: '#fafafa',
          position: 'relative',
          overflow: 'hidden'
        }}
      />
      
      {/* 집단 목록 표시 */}
      {showClusters && clusters.length > 0 && (
        <div className="clusters-list">
          <h4 className="clusters-title">발견된 집단 ({clusters.length}개)</h4>
          <div className="clusters-grid">
            {clusters.map((cluster, clusterIndex) => {
              const clusterColors = getClusterColors(clusters.length);
              return (
                <div key={clusterIndex} className="cluster-item">
                  <div className="cluster-header">
                    <span 
                      className="cluster-color" 
                      style={{ backgroundColor: clusterColors[clusterIndex] }}
                    ></span>
                    <span className="cluster-name">집단 {clusterIndex + 1}</span>
                    <span className="cluster-count">({cluster.length}개 노드)</span>
                  </div>
                  <div className="cluster-nodes">
                    {cluster.map((nodeId, nodeIndex) => (
                      <span key={nodeIndex} className="cluster-node">
                        {normalizeNodeName(nodeId)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph; 