import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { selectFilteredProjects } from "../../utils/selectors";
import { getProjectsAsync } from "../../redux/projects/projectCardThunks";
import { clearFilters } from "../../redux/projects/projectSlice";
import { REQUEST_STATE } from "../../redux/requestState";
import ProjectCard from "./ProjectCard";

import {
  UnorderedList,
  ListItem,
  Flex,
  Button,
  Text,
  Spinner,
} from "@chakra-ui/react";

const CARDS_PER_PAGE = 5;

/**
 * Renders a list of project cards with pagination.
 *
 * @returns {JSX.Element} The rendered project cards component.
 * 
 * Page navigation logic adapted from Google Gemini code (June 6, 2024).
 * Query: how do I adjust my project cards to display 5 at a time with
 *   multiple pages to scroll through if there's more than 5?
 */
export default function ProjectCards({ sortOption }) {
  const dispatch = useDispatch();
  const displayedCards = useSelector(selectFilteredProjects);
  const getProjectsStatus = useSelector((state) => state.projects.getProjects);
  const error = useSelector((state) => state.projects.error);

  const hasResults = displayedCards.length > 0;
  const maxPage = Math.ceil(displayedCards.length / CARDS_PER_PAGE);

  const [currPage, setCurrPage] = useState(1);

  const sortProjects = (projects, option) => {
    switch (option) {
      case 'Newest':
        return [...projects].sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
      case 'Oldest':
        return [...projects].sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
      case 'Most Active':
        return [...projects].sort((a, b) => new Date(b.lastActivityDate) - new Date(a.lastActivityDate));
      default:
        return projects;
    }
  };

  const sortedProjects = sortProjects(displayedCards, sortOption);

  const currPageCards = sortedProjects.slice(
    (currPage - 1) * CARDS_PER_PAGE,
    currPage * CARDS_PER_PAGE
  );

  const pageChange = (pageNumber) => {
    setCurrPage(pageNumber);
  };

  useEffect(() => {
    dispatch(clearFilters());
    dispatch(getProjectsAsync());
  }, [dispatch]);

  if (getProjectsStatus === REQUEST_STATE.PENDING) {
    return <Spinner />;
  }

  if (getProjectsStatus === REQUEST_STATE.REJECTED) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <>
      {currPageCards.length === 0 ? (
        currPage === 1 ? (
          <Text pt="20px">
            Oops! We don't have any projects matching those filters.
          </Text>
        ) : (
          setCurrPage(1)
        )
      ) : (
        <UnorderedList listStyleType="none">
          {currPageCards.map((card, index) => (
            <ListItem key={index}>
              <ProjectCard project={card} />
            </ListItem>
          ))}
        </UnorderedList>
      )}

      {hasResults && (
        <Flex align="center" justify="center">
          <Button
            variant="link"
            size="sm"
            _hover={{ textDecoration: "none" }}
            color="blue"
            padding="10px"
            onClick={() => pageChange(currPage - 1)}
            disabled={currPage <= 1}
            opacity={currPage <= 1 ? 0 : 1}
            pointerEvents={currPage <= 1 ? "none" : "auto"}
          >
            PREVIOUS
          </Button>

          <Text>
            Page {currPage} of {maxPage}
          </Text>

          <Button
            variant="link"
            size="sm"
            _hover={{ textDecoration: "none" }}
            color="blue"
            padding={["5px", "10px"]}
            onClick={() => pageChange(currPage + 1)}
            disabled={currPage >= maxPage}
            opacity={currPage >= maxPage ? 0 : 1}
            pointerEvents={currPage >= maxPage ? "none" : "auto"}
          >
            NEXT
          </Button>
        </Flex>
      )}
    </>
  );
}
