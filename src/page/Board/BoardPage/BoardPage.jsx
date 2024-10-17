/** @jsxImportSource @emotion/react */
import * as s from "./style";
import { useEffect, useRef, useState } from 'react';
import 'swiper/css'
import 'swiper/css/pagination';
import { useNavigate } from 'react-router-dom';
import { instance } from '../../../apis/util/instance';
import { useInfiniteQuery } from "react-query";
import BoardList from "../../../components/BoardList/BoardList";

function BoardPage(props) {
    const [searchValue, setSearchValue] = useState("");
    const [searchFilter, setSearchFilter] = useState("title");
    const [selectedButton, setSelectedButton] = useState('공지');
    const loadMoreRef = useRef(null);
    const navigate = useNavigate();
    const limit = 5;

    const { data, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery(
        ["boardListQuery"],
        async ({ pageParam = 1 }) => await instance.get(`/board/list?page=${pageParam}&limit=${limit}&searchFilter=${searchFilter}&searchValue=${searchValue}`),
        {
            getNextPageParam: (lastPage, allPage) => {
                const totalPageCount = lastPage.data.totalCount % limit === 0
                    ? lastPage.data.totalCount / limit
                    : Math.floor(lastPage.data.totalCount / limit) + 1
                return totalPageCount !== allPage.length ? allPage.length + 1 : null;
            },
            retry: 0,
            refetchOnWindowFocus: false,
        }
    );

    useEffect(() => {
        if (!hasNextPage || !loadMoreRef.current) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchNextPage();
            }
        }, { threshold: 0.5 });

        observer.observe(loadMoreRef.current);

        return () => observer.disconnect();

    }, [hasNextPage]);

    const handleFilterOnChange = (e) => {
        setSearchFilter(e.target.value);
    }

    const handleSearchInputOnChange = (e) => {
        setSearchValue(e.target.value);
    }

    const handleSearchOnClick = (e) => {
        refetch();
    }

    const handleEnterInput = (e) => {
        if (e.key === "Enter") {
            refetch();
        }
    }

    const handleNavButtonClick = (buttonName) => {
        setSelectedButton(buttonName);
    };

    return (
        <div css={s.layout}>
            <div css={s.boardLayout}>
                <div css={s.boardHeader}>
                    <h1>커뮤니티</h1>
                </div>
                <div css={s.boardNavigater}>
                    <button
                        onClick={() => handleNavButtonClick('공지')}
                        style={{ fontWeight: selectedButton === '공지' ? 'bold' : 'normal' }}
                    >
                        공지
                    </button>
                    <button
                        onClick={() => handleNavButtonClick('자유')}
                        style={{ fontWeight: selectedButton === '자유' ? 'bold' : 'normal' }}
                    >
                        자유
                    </button>
                </div>
                <div css={s.boardListLayout}>
                    <div css={s.boardListHeader}>
                        {/* <h3>총 {data?.pages?.data.totalCount}개</h3> */}
                        <select name="searchFilter" onChange={handleFilterOnChange}>
                            <option name="title" value={"title"}>제목</option>
                            <option name="writer" value={"writer"}>작성자</option>
                        </select>
                        <div css={s.searchBox}>
                            <input
                                type="text"
                                placeholder='검색'
                                onChange={handleSearchInputOnChange}
                                onKeyDown={handleEnterInput}
                                name=""
                                value={searchValue}
                            />
                            <button onClick={handleSearchOnClick}>검색</button>
                        </div>
                        <button css={s.writeButton} onClick={() => navigate("/board/write")}>글쓰기</button>
                    </div>
                    <div css={s.boardList}>
                        <BoardList data={data} loadMoreRef={loadMoreRef} />
                        <div ref={loadMoreRef}>ref</div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}

export default BoardPage;